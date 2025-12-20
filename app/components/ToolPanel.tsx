// @/app/components/ToolPanel.tsx
"use client";

import type { Block } from "@/hooks/useCardBlocks";
import type { TabKey } from "@/shared/editor";
import type { DesignKey } from "@/shared/design";
import type { FontKey } from "@/shared/fonts";

import TextTab from "@/app/components/tabs/TextTab";
import DesignTab from "@/app/components/tabs/DesignTab";
import ExportTab from "@/app/components/tabs/ExportTab";
import FontTab from "@/app/components/tabs/FontTab";

type Side = "front" | "back";

type Props = {
  open: boolean;
  onClose: () => void;
  activeTab: TabKey | null;
  activeBlockId: string
  variant?: "desktop" | "sheet";

  side: Side;
  onChangeSide: (side: Side) => void;

  blocks: Block[];
  isPreview: boolean;
  onChangeText: (id: string, value: string) => void;

  onTogglePreview: () => void;

  onChangeFont: (id: string, fontKey: FontKey) => void;

  design: DesignKey;
  onChangeDesign: (design: DesignKey) => void;

  fontFamily: string;

  onDownload: (
    format: "png" | "jpeg",
    design: DesignKey,
    options?: { quality?: number; pixelRatio?: number; fontFamily?: string }
  ) => void;
};

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl bg-white/70 backdrop-blur p-4
                    shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_18px_rgba(0,0,0,0.06)]"
    >
      <div className="mb-3">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        {desc && <p className="mt-1 text-xs text-zinc-500">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

function SideToggle({
  side,
  onChangeSide,
}: {
  side: Side;
  onChangeSide: (s: Side) => void;
}) {
  return (
    <div
      className="inline-flex rounded-xl bg-white/60 backdrop-blur p-1
                shadow-[0_1px_0_rgba(0,0,0,0.08)]"
    >
      <button
        type="button"
        onClick={() => onChangeSide("front")}
        className={[
          "px-3 py-1.5 text-sm rounded-lg transition",
          side === "front"
            ? "bg-pink-500/15 text-pink-700"
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
            ? "bg-pink-500/15 text-pink-700"
            : "text-zinc-600 hover:bg-zinc-900/5",
        ].join(" ")}
      >
        裏面
      </button>
    </div>
  );
}

export default function ToolPanel({
  open,
  onClose,
  activeTab,
  activeBlockId,
  side,
  onChangeSide,
  blocks,
  isPreview,
  onChangeText,
  onChangeFont,
  onTogglePreview,
  design,
  onChangeDesign,
  onDownload,
  variant = "desktop",
}: Props) {
  // ✅ open と activeTab を一致させる（事故防止）
  if (!open || !activeTab) return null;

  const showHeader = variant !== "sheet"; // ✅ sheet の時はヘッダー無し

  const title =
    activeTab === "design"
      ? "デザイン"
      : activeTab === "text"
      ? "テキスト"
      : activeTab === "export"
      ? "書き出し"
      : "編集";

  return (
    // ✅ xl以上だけ「左固定パネル」、xl未満は「普通のコンテンツ」
    <aside
      className={[
        "w-full",
        "xl:fixed xl:left-14 xl:top-14 xl:z-30",
        "xl:h-[calc(100vh-56px)] xl:w-[360px]",
        "xl:bg-white/70 xl:backdrop-blur",
        "xl:shadow-[1px_0_0_rgba(0,0,0,0.06)]",
      ].join(" ")}
    >
      {/* ✅ 見出し：BottomSheetでも上に残る */}
      <div className="sticky top-0 z-10 -mx-4 mb-3 bg-white/90 px-4 lg:py-3 backdrop-blur xl:mx-0 xl:mb-0 xl:bg-transparent xl:px-3 xl:py-2">
        {/* ✅ showHeader のときだけ描画する */}
        {showHeader && (
          <div
            className="sticky top-0 z-10 px-4 py-3 xl:px-3 xl:py-2
                  bg-white/60 backdrop-blur
                  shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-800">{title}</div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-900/5"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ 本文：Desktopはパネル内スクロール、MobileはBottomSheet側でスクロール */}
      <div
        className={[
          "overflow-y-auto p-4",
          variant === "desktop" ? "h-[calc(100%-41px)]" : "h-full",
        ].join(" ")}
      >
        {" "}
        {activeTab === "text" && (
          <Section title="編集する面" desc="表面 / 裏面 を切り替えます。">
            <SideToggle side={side} onChangeSide={onChangeSide} />
          </Section>
        )}
        {activeTab === "text" && (
          <Section
            title="テキスト編集"
            desc="内容を入力してプレビューで確認できます。"
          >
            <TextTab
              blocks={blocks}
              isPreview={isPreview}
              onChangeText={onChangeText}
              onTogglePreview={onTogglePreview}
            />
          </Section>
        )}
        {activeTab === "font" && (
          <Section title="フォント" desc="文字のフォントを選択します。">
            <FontTab
              value={blocks.find((b) => b.id === "name")?.fontKey ?? "sans"}
              onChange={(font) => onChangeFont(activeBlockId, font)}
            />
          </Section>
        )}
        {activeTab === "design" && (
          <Section
            title="背景デザイン"
            desc="カードの背景デザインを選択します。"
          >
            <DesignTab value={design} onChange={onChangeDesign} />
          </Section>
        )}
        {activeTab === "export" && (
          <Section title="書き出し" desc="画像として保存します。">
            <ExportTab design={design} onDownload={onDownload} />
          </Section>
        )}
      </div>
    </aside>
  );
}
