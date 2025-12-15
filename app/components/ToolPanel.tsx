"use client";

import type { Block } from "@/hooks/useCardBlocks";
import type { TabKey } from "@/shared/editor";
import type { DesignKey } from "@/shared/design";

import TextTab from "@/app/components/tabs/TextTab";
import DesignTab from "@/app/components/tabs/DesignTab";
import ExportTab from "@/app/components/tabs/ExportTab";
// import FontTab from "@/app/components/tabs/FontTab"; // あるなら

type Side = "front" | "back";

type Props = {
  activeTab: TabKey;

  side: Side;
  onChangeSide: (side: Side) => void;

  blocks: Block[];
  isPreview: boolean;
  onChangeText: (id: string, value: string) => void;

  // TextTab でプレビュー復活させたなら
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
  return (
    <aside className="w-[360px] shrink-0 border-r bg-white/70 backdrop-blur">
      <div className="h-full overflow-y-auto p-4">
        {/* Textの時だけ 表/裏トグル */}
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

        {/* activeTab === "font" があるならここ */}
        {/* {activeTab === "font" && (
          <FontTab value={fontFamily} onChange={onChangeFontFamily} />
        )} */}
      </div>
    </aside>
  );
}
