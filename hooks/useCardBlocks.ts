// hooks/useCardBlocks.ts
"use client";

import { useEffect, useRef, useState } from "react";

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

export type DesignKey = "plain" | "girl" | "kinmokusei" | "usaCarrot";

// とりあえずこのファイルにデザイン定義を持たせる（あとで shared/ に出してもOK）
const CARD_DESIGNS: Record<
  DesignKey,
  {
    bgColor: string;
    image?: string;
    mode?: "cover" | "contain";
  }
> = {
  plain: {
    bgColor: "#e2c7a3",
  },
  girl: {
    bgColor: "#e9edf5",
    image: "/girl.png",
    mode: "cover",
  },
  kinmokusei: {
    bgColor: "#fff5e5",
    image: "/kinmokusei.png",
    mode: "cover",
  },
  usaCarrot: {
    bgColor: "#ffffff",
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

  // マウスダウン開始
  const handleMouseDown = (
    e: React.MouseEvent,
    id: string,
    options?: DragOptions
  ) => {
    if (options?.disabled) return;

    const scale = options?.scale ?? 1;

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

  // 画像書き出し
  const downloadImage = async (format: "png" | "jpeg", design: DesignKey) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina 対応で 2 倍スケール
    ctx.scale(2, 2);

    const conf = CARD_DESIGNS[design];

    // 背景色
    ctx.fillStyle = conf.bgColor;
    ctx.fillRect(0, 0, width, height);

    // 背景画像がある場合は描画
    if (conf.image) {
      try {
        const img = await loadImage(conf.image);
        drawCoverOrContainImage(ctx, img, conf.mode ?? "cover", width, height);
      } catch (e) {
        console.error(e);
      }
    }

    // テキストブロックを描画
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
