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

  // refs
  cardRef: React.RefObject<HTMLDivElement | null>;
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;

  // outside click etc
  onSurfacePointerDown?: () => void;

  // inline editing
  editingBlockId?: string | null;
  onStopEditing?: () => void;
  onPreviewText?: (id: string, text: string) => void;
  onCommitText?: (id: string, text: string) => void;
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
  onSurfacePointerDown,
  editingBlockId,
  onStopEditing,
  onPreviewText,
  onCommitText,
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
        {/* ✅ scaleする箱（ここが Card + textarea の共通親） */}
        <div
          ref={cardRef} // ✅ ここに付けるのが重要
          className={[
            "relative",
            isPreview ? "overflow-hidden" : "overflow-visible",
          ].join(" ")}
          style={{
            width: CARD_BASE_W,
            height: CARD_BASE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <CardSurface
            blocks={blocks}
            design={design}
            w={CARD_BASE_W}
            h={CARD_BASE_H}
            interactive={!isPreview}
            onSurfacePointerDown={() => onSurfacePointerDown?.()}
            onBlockPointerDown={(e, id) => onPointerDown?.(e, id, { scale })}
            onBlockDoubleClick={isPreview ? undefined : onBlockDoubleClick}
            activeBlockId={activeBlockId}
            editingBlockId={editingBlockId} // ✅ 二重文字防止
            blockRefs={blockRefs}
            className={isPreview ? "shadow-lg" : ""}
          />

          {/* ✅ Inline editor overlay（CardSurface と同じ scale 階層） */}
          {!isPreview &&
            editingBlockId &&
            (() => {
              const b = blocks.find((x) => x.id === editingBlockId);
              if (!b || b.type !== "text") return null;

              return (
                <textarea
                  key={b.id}
                  autoFocus
                  defaultValue={b.text}
                  onPointerDown={(e) => e.stopPropagation()}
                  onChange={(e) => onPreviewText?.(b.id, e.currentTarget.value)}
                  onBlur={(e) => {
                    onCommitText?.(b.id, e.currentTarget.value);
                    onStopEditing?.();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onCommitText?.(
                        b.id,
                        (e.currentTarget as HTMLTextAreaElement).value
                      );
                      onStopEditing?.();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      onStopEditing?.();
                    }
                  }}
                  style={{
                    position: "absolute",
                    left: b.x,
                    top: b.y,
                    fontSize: `${b.fontSize}px`,
                    fontWeight: b.fontWeight,
                    minWidth: 120,
                    padding: "2px 6px",
                    borderRadius: 6,
                    border: "2px solid rgba(236, 72, 153, 0.7)",
                    background: "rgba(255,255,255,0.92)",
                    lineHeight: 1.2,
                    zIndex: 50,
                  }}
                  className="resize-none outline-none"
                />
              );
            })()}
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
