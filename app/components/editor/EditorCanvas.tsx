// app/components/editor/EditorCanvas.tsx
"use client";

import React from "react";
import CardSurface from "@/app/components/CardSurface";
import PrintGuides from "@/app/components/editor/PrintGuides";
import type { Block } from "@/shared/blocks";
import type { DesignKey } from "@/shared/design";
import { CARD_BASE_W, CARD_BASE_H } from "@/shared/print";

type Props = {
  blocks: Block[];
  design: DesignKey;
  scale: number;
  activeBlockId?: string;
  isPreview: boolean;
  showGuides: boolean;
  onPointerDown?: (
    e: React.PointerEvent,
    id: string,
    opts: { scale: number }
  ) => void;
  onBlockDoubleClick?: (id: string) => void;
  cardRef: React.RefObject<HTMLDivElement | null>;
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
};

export default function EditorCanvas({
  blocks,
  design,
  scale,
  isPreview,
  showGuides,
  onPointerDown,
  onBlockDoubleClick,
  activeBlockId,
  cardRef,
  blockRefs,
}: Props) {
  return (
    <section className="flex flex-col items-center gap-3">
      <div
        className="relative mx-auto"
        style={{
          width: CARD_BASE_W * scale,
          height: CARD_BASE_H * scale,
        }}
      >
        <div
          style={{
            width: CARD_BASE_W,
            height: CARD_BASE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className={isPreview ? "overflow-hidden" : "overflow-visible"}
        >
          <CardSurface
            blocks={blocks}
            design={design}
            w={CARD_BASE_W}
            h={CARD_BASE_H}
            interactive={!isPreview}
            onBlockPointerDown={(e, id) => onPointerDown?.(e, id, { scale })}
            onBlockDoubleClick={isPreview ? undefined : onBlockDoubleClick}
            activeBlockId={activeBlockId}
            cardRef={cardRef}
            blockRefs={blockRefs}
            className={isPreview ? "shadow-lg" : ""}
          />
        </div>

        {showGuides && (
          <PrintGuides scale={scale} cardW={CARD_BASE_W} cardH={CARD_BASE_H} />
        )}
      </div>

      {!isPreview && (
        <p className="w-full max-w-[480px] text-xs text-zinc-500">
          ※プレビュー時はドラッグできません。編集モードで配置を調整してください。
        </p>
      )}
    </section>
  );
}
