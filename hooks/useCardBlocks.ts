"use client";

import React, { useState, useRef, useEffect } from "react";

export type Block = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: "normal" | "bold";
};

export function useCardBlocks() {
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

  const [isDragging, setIsDragging] = useState(false);
  const [daragTargetId, setDragTargetId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const cardRef = useRef<HTMLDivElement | null>(null);
const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // テキスト変更
  const updateText = (id: string, text: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  // マウスダウン開始
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
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

  // ドラッグ移動
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging || !daragTargetId || !cardRef.current) return;

      const cardRect = cardRef.current.getBoundingClientRect();
      const targetEl = blockRefs.current[daragTargetId];
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
          b.id === daragTargetId ? { ...b, x: newX, y: newY } : b
        )
      );
    };

    const handleUp = () => {
      setIsDragging(false);
      setDragTargetId(null);
    };

    return () => {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    };
  }, [isDragging, daragTargetId, offset]);

    // PNG / JPEG 書き出し
    const downloadImage = async (format: "png" | "jpeg") => {
        if(!cardRef.current)  return;

        const canvas = document.createElement("canvas");
        canvas.width = 400 * 2;
        canvas.height = 260 * 2;

        const ctx = canvas.getContext("2d")!;
        ctx.scale(2, 2);

        const rect = cardRef.current.getBoundingClientRect();
        const style = window.getComputedStyle(cardRef.current);

        ctx.fillStyle = style.backgroundColor || "#ffffff";
        ctx.fillRect(0,0, rect.width, rect.height);

        blocks.forEach((b) => {
            const fontBase = `${b.fontSize}px sans-serif`;
            ctx.font = b.fontWeight === "bold" ? `bold${fontBase}` : fontBase;
            ctx.fillStyle = "#1a1a1a";
            ctx.fillText(b.text, b.x, b.y + b.fontSize);
        });

        const link = document.createElement("a");
        link.download = `card.${format}`;
        link.href = 
            format === "png"
                ? canvas.toDataURL("image/png")
                : canvas.toDataURL("iamge/jpeg", 0.92);
                link.click();
    };

    return {
        blocks,
        setBlocks,
        updateText,
        handleMouseDown,
        cardRef,
        blockRefs,
        downloadImage,
    }
}
