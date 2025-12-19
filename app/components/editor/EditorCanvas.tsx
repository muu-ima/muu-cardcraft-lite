"use client";

import React from "react";
import CardSurface from "@/app/components/CardSurface";
import PrintGuides from "@/app/components/editor/PrintGuides";
import type { Block } from "@/hooks/useCardBlocks";
import type { DesignKey } from "@/shared/design";

const EXPORT_W = 480;
const EXPORT_H = 260;

type Props = {
  blocks: Block[];
  design: DesignKey;
  scale: number;
  isPreview: boolean;
  showGuides: boolean;
  onPointerDown: (
    e: React.PointerEvent,
    id: string,
    opts: { scale: number }
  ) => void;
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
  cardRef,
  blockRefs,
}: Props) {
  return (
    <section className="flex flex-col items-center gap-3">
      <div
        className="relative mx-auto"
        style={{
          width: EXPORT_W * scale,
          height: EXPORT_H * scale,
        }}
      >
        <div
          style={{
            width: EXPORT_W,
            height: EXPORT_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <CardSurface
            blocks={blocks}
            design={design}
            interactive={!isPreview}
            onBlockPointerDown={(e, id) => onPointerDown(e, id, { scale })}
            cardRef={cardRef}
            blockRefs={blockRefs}
            className={isPreview ? "shadow-lg" : ""}
          />
        </div>

        {showGuides && (
          <PrintGuides scale={scale} cardW={EXPORT_W} cardH={EXPORT_H} />
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
