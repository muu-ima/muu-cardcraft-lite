// hooks/useCardBlocks.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { useHistoryState } from "@/hooks/History";
import { CARD_BASE_W, CARD_BASE_H } from "@/shared/print";
import type { FontKey } from "@/shared/fonts";
import { useExportImage } from "@/hooks/export/useExportImage";
import type { Block } from "@/shared/blocks";

type DragOptions = {
  disabled?: boolean;
  scale?: number;
};

// ✅ 初期ブロックは定数に（毎レンダリングで作らない）
const INITIAL_BLOCKS: Block[] = [
  {
    id: "name",
    type: "text",
    text: "山田 太郎",
    x: 100,
    y: 120,
    fontSize: 24,
    fontWeight: "bold",
    fontKey: "serif",
  },
  {
    id: "title",
    type: "text",
    text: "デザイナー / Designer",
    x: 100,
    y: 80,
    fontSize: 18,
    fontWeight: "normal",
    fontKey: "sans",
  },
];

export function useCardBlocks() {
  const {
    present: blocks,
    set,
    commit,
    undo,
    redo,
  } = useHistoryState<Block[]>(INITIAL_BLOCKS);

  // -------------------------
  // テキスト入力（軽い）
  // -------------------------
  const previewText = (id: string, text: string) => {
    set((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  // -------------------------
  // テキスト入力（確定）
  // -------------------------
  const commitText = (id: string, text: string) => {
    commit((prev) => {
      const cur = prev.find((b) => b.id === id);
      if (!cur || cur.text === text) return prev; // 変化なし→履歴増やさない
      return prev.map((b) => (b.id === id ? { ...b, text } : b));
    });
  };

  // -------------------------
  // フォント変更（確定操作）
  // -------------------------
  const updateFont = (id: string, fontKey: FontKey) => {
    commit((prev) => prev.map((b) => (b.id === id ? { ...b, fontKey } : b)));
  };

  // -------------------------
  // 新規テキスト追加（確定操作）
  // -------------------------
  const addBlock = () => {
    commit((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "text",
        text: "新しいテキスト",
        x: 100,
        y: 100,
        fontSize: 16,
        fontWeight: "normal",
        fontKey: "sans",
      },
    ]);
  };

  type TextStylePatch = Partial<{
    fontSize: number;
    fontWeight: "normal" | "bold";
    align: "left" | "center" | "right";
  }>;

  const updateTextStyle = (id: string, patch: TextStylePatch) => {
    set((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      // 入力中はブラウザ標準のUndoに任せる（重要）
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      if (!ctrlOrCmd) return;

      // Ctrl/Cmd + Z
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl/Cmd + Shift + Z（or Ctrl/Cmd + Y）
      if (
        (e.key.toLowerCase() === "z" && e.shiftKey) ||
        e.key.toLowerCase() === "y"
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  }, [commit]);

  const setRef = useRef(set);
  useEffect(() => {
    setRef.current = set;
  }, [set]);

  const movedRef = useRef(false);
  const beforeDragRef = useRef<Block[] | null>(null);
  // ドラッグ状態
  const [isDragging, setIsDragging] = useState(false);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // カードと各ブロックの DOM
  const cardRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const updateFontSize = (id: string, fontSize: number) => {
    // ✅ 1クリック = 1履歴にしたいので、操作直前に今の状態を積む
    commit(blocksRef.current);

    const next = clamp(Math.round(fontSize), 8, 72);
    set((prev) =>
      prev.map((b) => (b.id === id ? { ...b, fontSize: next } : b))
    );
  };

  const bumpFontSize = (id: string, delta: number) => {
    const cur = blocksRef.current.find((b) => b.id === id)?.fontSize ?? 16;

    updateFontSize(id, cur + delta);
  };

  const dragScaleRef = useRef(1);

  // マウスダウン開始
  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    options?: DragOptions
  ) => {
    if (options?.disabled) return;

    movedRef.current = false;
    beforeDragRef.current = blocks.map((b) => ({ ...b })); // ✅ 開始時点を保存

    const scale = options?.scale ?? 1;
    dragScaleRef.current = scale;

    e.currentTarget.setPointerCapture(e.pointerId);

    e.preventDefault();
    setDragTargetId(id);
    setIsDragging(true);

    const el = cardRef.current;
    if (!el) return;

    const cardRect = el.getBoundingClientRect();
    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    // 画面上のマウス座標 → カード内の論理座標(480x260基準)に変換
    const pointerX = (e.clientX - cardRect.left) / scale;
    const pointerY = (e.clientY - cardRect.top) / scale;

    setOffset({
      x: pointerX - block.x,
      y: pointerY - block.y,
    });
  };

  // ドラッグ中の座標更新
  useEffect(() => {
    const BASE_W = CARD_BASE_W;
    const BASE_H = CARD_BASE_H;

    const handleMove = (e: PointerEvent) => {
      if (!isDragging || !dragTargetId || !cardRef.current) return;

      // ✅ 最初の移動だけ「開始前」を履歴に積む
      if (!movedRef.current) {
        if (beforeDragRef.current) {
          commitRef.current(beforeDragRef.current);
        }
        movedRef.current = true;
      }

      const scale = dragScaleRef.current;
      const cardRect = cardRef.current.getBoundingClientRect();
      const targetEl = blockRefs.current[dragTargetId];
      if (!targetEl) return;

      // 見た目 → 論理
      const textWidth = targetEl.getBoundingClientRect().width / scale;

      // 画面座標 → 論理座標
      const pointerX = (e.clientX - cardRect.left) / scale;
      const pointerY = (e.clientY - cardRect.top) / scale;

      const rawX = pointerX - offset.x;
      const rawY = pointerY - offset.y;

      // BASE基準で clamp
      const maxX = BASE_W - textWidth;

      // ドラッグ対象ブロックの「文字の高さ」を使って、下端はみ出しを防ぐ
      const targetBlock = blocksRef.current.find((b) => b.id === dragTargetId);
      const approxTextHeight = targetBlock?.fontSize ?? 20; // fontSize ≒ 文字の高さ(ざっくり)
      const maxY = BASE_H - approxTextHeight;

      const newX = Math.max(0, Math.min(maxX, rawX));
      const newY = Math.max(0, Math.min(maxY, rawY));

      setRef.current((prev) =>
        prev.map((b) =>
          b.id === dragTargetId ? { ...b, x: newX, y: newY } : b
        )
      );
    };

    const handleUp = (e: PointerEvent) => {
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {}

      setIsDragging(false);
      setDragTargetId(null);

      movedRef.current = false;
      beforeDragRef.current = null; // ✅ 必ず破棄
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging, dragTargetId, offset]);

  const { downloadImage } = useExportImage();

  return {
    blocks,
    addBlock,
    previewText,
    commitText,
    updateFont,
    updateFontSize,
    updateTextStyle,
    bumpFontSize,
    handlePointerDown,
    cardRef,
    blockRefs,
    downloadImage,
    undo,
    redo,
  };
}
