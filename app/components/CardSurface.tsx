// app/components/CardSurface.tsx
"use client";

import React from "react";
import type { CSSProperties, RefObject } from "react";
import type { Block } from "@/shared/blocks";
import type { DesignKey } from "@/shared/design";
import { CARD_FULL_DESIGNS } from "@/shared/cardDesigns";
import { FONT_DEFINITIONS } from "@/shared/fonts";

type CardSurfaceProps = {
  blocks: Block[];
  design: DesignKey;

  w: number;
  h: number;

  /** 編集可能か (ドラッグ有無) */
  interactive?: boolean;

  /** ブロック押下（選択/ドラッグ開始） */
  onBlockPointerDown?: (
    e: React.PointerEvent<HTMLDivElement>,
    blockId: string
  ) => void;

  /** ダブルクリックで編集開始（text blockのみ） */
  onBlockDoubleClick?: (blockId: string) => void;

  /** 外クリック（選択解除など） */
  onSurfacePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;

  /** 選択中ブロック */
  activeBlockId?: string;

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
  onBlockDoubleClick,
  onSurfacePointerDown,
  activeBlockId,
  cardRef,
  blockRefs,
  className,
  style,
}: CardSurfaceProps) {
  return (
    <div
      ref={cardRef}
      onPointerDown={(e) => {
        if (!interactive) return;

        // ✅ ルートで外クリック判定（ブロック以外を押した）
        const target = e.target as HTMLElement;
        const hitBlock = target.closest("[data-block-id]");
        if (!hitBlock) onSurfacePointerDown?.(e);
      }}
      style={{
        width: w,
        height: h,
        position: "relative",
        ...getCardStyle(design),
        ...style,
        touchAction: "none",
      }}
      className={`rounded-xl border shadow-md ${className ?? ""}`}
    >
      {blocks.map((block) => {
        const showSelection = interactive && activeBlockId === block.id;

        return (
          <div
            key={block.id}
            data-block-id={block.id}
            ref={(el) => {
              if (blockRefs) blockRefs.current[block.id] = el;
            }}
            onPointerDown={(e) => {
              if (!interactive) return;
              e.stopPropagation(); // ✅ 外クリック判定に伝播させない
              onBlockPointerDown?.(e, block.id); // ✅ フォーカス/ドラッグ開始
            }}
            onDoubleClick={
              interactive && onBlockDoubleClick && block.type === "text"
                ? () => onBlockDoubleClick(block.id)
                : undefined
            }
            // 「選択中をもう一回クリックで編集」は CardEditor 側で制御してるなら不要
            style={{
              position: "absolute",
              top: block.y,
              left: block.x,
              cursor: interactive ? "move" : "default",
              padding: "2px 4px",
            }}
            className={[
              "select-none text-zinc-900 dark:text-zinc-50",
              showSelection ? "ring-2 ring-pink-400/70 rounded" : "",
            ].join(" ")}
          >
            <div
              style={{
                fontSize: `${block.fontSize}px`,
                fontWeight: block.fontWeight,
                fontFamily:
                  FONT_DEFINITIONS[block.fontKey]?.css ??
                  FONT_DEFINITIONS.sans.css,
                whiteSpace: "pre",
                width: "max-content",
                maxWidth: "none",
                overflowWrap: "normal",
                wordBreak: "normal",
              }}
            >
              {block.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
