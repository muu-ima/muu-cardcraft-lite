// app/components/CardSurface.tsx
"use client";

import type { CSSProperties, RefObject } from "react";
import type { Block } from "@/hooks/useCardBlocks";
import type { DesignKey } from "@/shared/design";
import { CARD_DESIGNS } from "@/shared/design";
import React from "react";

type CardSurfaceProps = {
  blocks: Block[];
  design: DesignKey;

  /** 編集可能か (ドラッグ有無) */
  interactive?: boolean;

  /** 編集用（タップ/マウス共通） */
  onBlockPointerDown?: (
    e: React.PointerEvent<HTMLDivElement>,
    blockId: string
  ) => void;

  /** editor / export 用 ref */
  cardRef?: RefObject<HTMLDivElement | null>;
  blockRefs?: React.MutableRefObject<Record<string, HTMLDivElement | null>>;

  /** class / style 拡張 */
  className?: string;
  style?: CSSProperties;
};

const BASE_W = 480;
const BASE_H = 260;

function getCardStyle(design: DesignKey): CSSProperties {
  const conf = CARD_DESIGNS[design];

  if (!conf.image) return { backgroundColor: conf.bgColor };

  return {
    backgroundImage: `url(${conf.image})`,
    backgroundSize: conf.mode === "contain" ? "contain" : "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundColor: conf.bgColor ?? "#ffffff",
  };
}

export default function CardSurface({
  blocks,
  design,
  interactive = false,
  onBlockPointerDown,
  cardRef,
  blockRefs,
  className,
  style,
}: CardSurfaceProps) {
  return (
    <div
      ref={cardRef}
      style={{
        width: BASE_W,
        height: BASE_H,
        position: "relative",
        ...getCardStyle(design),
        ...style,
      }}
      className={`rounded-xl border shadow-md overflow-hidden ${
        className ?? ""
      }`}
    >
      {blocks.map((block) => (
        <div
          key={block.id}
          ref={(el) => {
            if (blockRefs) blockRefs.current[block.id] = el;
          }}
          onPointerDown={
            interactive && onBlockPointerDown
              ? (e) => onBlockPointerDown(e, block.id)
              : undefined
          }
          style={{
            position: "absolute",
            top: block.y,
            left: block.x,
            cursor: interactive ? "move" : "default",
          }}
          className={`select-none whitespace-nowrap text-zinc-900 dark:text-zinc-50 ${
            block.fontWeight === "bold" ? "font-bold" : "font-normal"
          }`}
        >
          <span style={{ fontSize: `${block.fontSize}px` }}>{block.text}</span>
        </div>
      ))}
    </div>
  );
}
