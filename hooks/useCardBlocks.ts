// hooks/useCardBlocks.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { DesignKey } from "@/shared/design";

type DragOptions = {
  disabled?: boolean;
  scale?: number;
};

export type Block = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: "normal" | "bold";
};

// とりあえずこのファイルにデザイン定義を持たせる（あとで shared/ に出してもOK）
const CARD_DESIGNS: Record<
  DesignKey,
  {
    bgColor?: string;
    image?: string;
    mode?: "cover" | "contain";
  }
> = {
  plain: {
    bgColor: "#e2c7a3",
  },
  girl: {
    image: "/girl.png",
    mode: "cover",
  },
  kinmokusei: {
    image: "/kinmokusei.png",
    mode: "cover",
  },
  usaCarrot: {
    image: "/usa-carrot.png",
    mode: "contain",
  },
};

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

  const dragScaleRef = useRef(1);

  // マウスダウン開始
  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    options?: DragOptions
  ) => {
    if (options?.disabled) return;

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
    const BASE_W = 480;
    const BASE_H = 260;

    const handleMove = (e: PointerEvent) => {
      if (!isDragging || !dragTargetId || !cardRef.current) return;

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
      const maxY = BASE_H - 20;

      const newX = Math.max(0, Math.min(maxX, rawX));
      const newY = Math.max(0, Math.min(maxY, rawY));

      setBlocks((prev) =>
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

  // 画像ロード用の小さいヘルパー
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    });
  };

  // cover / contain の描画ヘルパー
  const drawCoverOrContainImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    mode: "cover" | "contain",
    width: number,
    height: number
  ) => {
    const iw = img.width;
    const ih = img.height;

    let drawW = width;
    let drawH = height;
    let dx = 0;
    let dy = 0;

    if (mode === "contain") {
      const scale = Math.min(width / iw, height / ih);
      drawW = iw * scale;
      drawH = ih * scale;
      dx = (width - drawW) / 2;
      dy = (height - drawH) / 2;
    } else {
      // cover
      const scale = Math.max(width / iw, height / ih);
      drawW = iw * scale;
      drawH = ih * scale;
      dx = (width - drawW) / 2;
      dy = (height - drawH) / 2;
    }

    ctx.drawImage(img, dx, dy, drawW, drawH);
  };

  const EXPORT_W = 480;
  const EXPORT_H = 260;

  // 画像書き出し
  const downloadImage = async (format: "png" | "jpeg", design: DesignKey) => {
    // cardRef の存在チェックは不要でもいいが、残してOK
    // if (!cardRef.current) return;

    const width = EXPORT_W;
    const height = EXPORT_H;

    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(2, 2);

    const conf = CARD_DESIGNS[design];

    ctx.fillStyle = conf.bgColor ?? "#ffffff";
    ctx.fillRect(0, 0, width, height);

    if (conf.image) {
      try {
        const img = await loadImage(conf.image);
        drawCoverOrContainImage(ctx, img, conf.mode ?? "cover", width, height);
      } catch (e) {
        console.error(e);
      }
    }

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
    handlePointerDown,
    cardRef,
    blockRefs,
    downloadImage,
  };
}
