// @/app/components/ToolPanel.tsx

"use client";

import type { Block } from "@/hooks/useCardBlocks";
import type { TabKey } from "@/shared/editor";
import type { DesignKey } from "@/shared/design";

import TextTab from "@/app/components/tabs/TextTab";
import DesignTab from "@/app/components/tabs/DesignTab";
import ExportTab from "@/app/components/tabs/ExportTab";

type Side = "front" | "back";

type Props = {
  open: boolean;
  onClose: () => void;
  activeTab: TabKey | null;

  side: Side;
  onChangeSide: (side: Side) => void;

  blocks: Block[];
  isPreview: boolean;
  onChangeText: (id: string, value: string) => void;

  onTogglePreview: () => void;

  design: DesignKey;
  onChangeDesign: (design: DesignKey) => void;

  fontFamily: string;

  onDownload: (
    format: "png" | "jpeg",
    design: DesignKey,
    options?: { quality?: number; pixelRatio?: number; fontFamily?: string }
  ) => void;
};

export default function ToolPanel({
  open,
  onClose,
  activeTab,
  side,
  onChangeSide,
  blocks,
  isPreview,
  onChangeText,
  onTogglePreview,
  design,
  onChangeDesign,
  onDownload,
}: Props) {
  // ✅ open と activeTab を一致させる（事故防止）
  if (!open || !activeTab) return null;

  const title =
    activeTab === "text"
      ? "テキスト"
      : activeTab === "design"
      ? "デザイン"
      : activeTab === "export"
      ? "書き出し"
      : "パネル";

  return (
    <aside className="fixed left-14 top-14 z-30 h-[calc(100vh-56px)] w-[360px] border-r bg-white/70 backdrop-blur">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="text-xs text-zinc-500">{title}</p>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-900/5"
        >
          閉じる
        </button>
      </div>

      <div className="h-[calc(100%-41px)] overflow-y-auto p-4">
        {activeTab === "text" && (
          <div className="mb-4">
            <p className="mb-2 text-xs text-zinc-500">編集する面</p>
            <div className="inline-flex rounded-xl border bg-white p-1">
              <button
                type="button"
                onClick={() => onChangeSide("front")}
                className={[
                  "px-3 py-1.5 text-sm rounded-lg transition",
                  side === "front"
                    ? "bg-blue-600/10 text-blue-700"
                    : "text-zinc-600 hover:bg-zinc-900/5",
                ].join(" ")}
              >
                表面
              </button>
              <button
                type="button"
                onClick={() => onChangeSide("back")}
                className={[
                  "px-3 py-1.5 text-sm rounded-lg transition",
                  side === "back"
                    ? "bg-blue-600/10 text-blue-700"
                    : "text-zinc-600 hover:bg-zinc-900/5",
                ].join(" ")}
              >
                裏面
              </button>
            </div>
          </div>
        )}

        {activeTab === "text" && (
          <TextTab
            blocks={blocks}
            isPreview={isPreview}
            onChangeText={onChangeText}
            onTogglePreview={onTogglePreview}
          />
        )}

        {activeTab === "design" && (
          <DesignTab value={design} onChange={onChangeDesign} />
        )}

        {activeTab === "export" && (
          <ExportTab design={design} onDownload={onDownload} />
        )}
      </div>
    </aside>
  );
}
