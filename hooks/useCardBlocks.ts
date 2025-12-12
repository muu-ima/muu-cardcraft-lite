// hooks/useCardBlocks.ts
"use client";

import { useEffect, useRef, useState } from "react";

export type Block = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: "normal" | "bold";
};

export type DesignKey = "plain" | "girl" | "kinmokusei" | "usaCarrot";

export function useCardBlocks() {
  // 初期ブロック
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "name",
      text: "山田 太郎",
      x: 100,
      y: 120,
      fontSize: 24,
      fontWeight: "bold",
    },
    {
      id: "title",
      text: "デザイナー / Designer",
      x: 100,
      y: 80,
      fontSize: 18,
      fontWeight: "normal",
    },
  ]);

  // ドラッグ状態
  const [isDragging, setIsDragging] = useState(false);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // カードと各ブロックの DOM
  const cardRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // テキスト変更
  const updateText = (id: string, text: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  // マウスダウン開始
  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    id: string,
    options?: { disabled?: boolean }
  ) => {
    if (options?.disabled) return;
    if (!cardRef.current) return;

    e.preventDefault();
    setDragTargetId(id);
    setIsDragging(true);

    const cardRect = cardRef.current.getBoundingClientRect();
    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    setOffset({
      x: e.clientX - cardRect.left - block.x,
      y: e.clientY - cardRect.top - block.y,
    });
  };

  // ドラッグ中の座標更新
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging || !dragTargetId || !cardRef.current) return;

      const cardRect = cardRef.current.getBoundingClientRect();
      const targetEl = blockRefs.current[dragTargetId];

      if (!targetEl) return;

      const textRect = targetEl.getBoundingClientRect();
      const textWidth = textRect.width;

      const rawX = e.clientX - cardRect.left - offset.x;
      const maxX = cardRect.width - textWidth;
      const newX = Math.max(0, Math.min(maxX, rawX));

      const rawY = e.clientY - cardRect.top - offset.y;
      const maxY = cardRect.height - 20;
      const newY = Math.max(0, Math.min(maxY, rawY));

      setBlocks((prev) =>
        prev.map((b) =>
          b.id === dragTargetId ? { ...b, x: newX, y: newY } : b
        )
      );
    };

    const handleUp = () => {
      setIsDragging(false);
      setDragTargetId(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging, dragTargetId, offset]);

  // 画像書き出し（背景色だけ拾う簡易版）
  const downloadImage = async (format: "png" | "jpeg", design: DesignKey) => {
    if (!cardRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = 480 * 2;
    canvas.height = 260 * 2;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(2, 2);

       // 背景を design に合わせて塗る
    switch (design) {
      case "girl":
        // girl は画像なので、fillRect だけだとダメで
        // 本気でやるなら Image を読んで drawImage する。
        // とりあえず今はカードの背景色だけ合わせるならこんな感じ
        ctx.fillStyle = "#bfc7d0"; // girl 背景のグレー
        break;
      case "kinmokusei":
        ctx.fillStyle = "#fff5e5"; // ざっくりの色
        break;
      case "usaCarrot":
        ctx.fillStyle = "#ffffff";
        break;
      case "plain":
      default:
        ctx.fillStyle = "#e2c7a3";
        break;
    }

    const rect = cardRef.current.getBoundingClientRect();
    const style = window.getComputedStyle(cardRef.current);

    ctx.fillStyle = style.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    blocks.forEach((b) => {
      const base = `${b.fontSize}px sans-serif`;
      ctx.font = b.fontWeight === "bold" ? `bold ${base}` : base;
      ctx.fillStyle = "#1a1a1a";
      ctx.fillText(b.text, b.x, b.y + b.fontSize);
    });

    const link = document.createElement("a");
    link.download = `card.${format}`;
    link.href =
      format === "png"
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", 0.92);
    link.click();
  };

  return {
    blocks,
    updateText,
    handleMouseDown,
    cardRef,
    blockRefs,
    downloadImage,
  };
}
