// app/components/CardSurface.tsx
"use client";

import type { CSSProperties, RefObject } from "react";
import type { Block } from "@/hooks/useCardBlocks";
import type { DesignKey } from "@/shared/design";
import { CARD_FULL_DESIGNS } from "@/shared/cardDesigns";
import { FONT_DEFINITIONS } from "@/shared/fonts";
import React from "react";

type CardSurfaceProps = {
  blocks: Block[];
  design: DesignKey;

  w: number;
  h: number;

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

function getCardStyle(design: DesignKey): CSSProperties {
  const bg = CARD_FULL_DESIGNS[design].bg;

  if (!bg.image) return { backgroundColor: bg.color };

  return {
    backgroundImage: `url(${bg.image})`,
    backgroundSize: bg.mode === "contain" ? "contain" : "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundColor: bg.color ?? "#ffffff",
  };
}

export default function CardSurface({
  blocks,
  design,
  w,
  h,
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
        width: w,
        height: h,
        position: "relative",
        ...getCardStyle(design),
        ...style,
        touchAction: "none",
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
          className="select-none whitespace-nowrap text-zinc-900 dark:text-zinc-50"
        >
          <span
            style={{
              fontSize: `${block.fontSize}px`,
              fontWeight: block.fontWeight, // "normal" | "bold"
              fontFamily:
                FONT_DEFINITIONS[block.fontKey]?.css ??
                FONT_DEFINITIONS.sans.css,
            }}
          >
            {block.text}
          </span>{" "}
        </div>
      ))}
    </div>
  );
}
