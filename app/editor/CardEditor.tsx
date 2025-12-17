"use client";

import React, { useEffect, useState } from "react";
import ModalPreview from "@/app/components/ModalPreview";
import Toolbar from "@/app/components/Toolbar";
import CardSurface from "@/app/components/CardSurface";
import ToolPanel from "@/app/components/ToolPanel";

import { useScaleToFit } from "@/hooks/useScaleToFit";
import { useCardBlocks } from "@/hooks/useCardBlocks";
import { type DesignKey } from "@/shared/design";
import { CARD_FULL_DESIGNS } from "@/shared/cardDesigns";
import type { TabKey } from "@/shared/editor";

type Side = "front" | "back";

export default function CardEditor() {
  const [side, setSide] = useState<Side>("back");
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const panelVisible = activeTab !== null;
  const [isPreview, setIsPreview] = useState(false);

  const [design, setDesign] = useState<DesignKey>("plain");
  const activeDesign = CARD_FULL_DESIGNS[design];

  // ✅ 同じタブ押し = 閉じる / 別タブ = 切替
  const onChangeTab = (tab: TabKey) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  // ★ CanvasArea内の幅でスケール作る（表面/裏面 共通）
  const { ref: canvasRef, scale } = useScaleToFit(480, true);

  // ★ モーダルはモーダル用に別スケール
  const { ref: previewWrapRef, scale: previewScale } = useScaleToFit(
    480,
    isPreview
  );

  const PREVIEW_W = 480;
  const PREVIEW_H = 260;

  const scaledW = PREVIEW_W * previewScale;
  const scaledH = PREVIEW_H * previewScale;

  const {
    blocks: editableBlocks,
    updateText,
    handlePointerDown,
    cardRef,
    blockRefs,
    downloadImage,
  } = useCardBlocks();

  const [frontEditableBlocks, setFrontEditableBlocks] = useState(
    activeDesign.front.blocks
  );

  useEffect(() => {
    setFrontEditableBlocks(CARD_FULL_DESIGNS[design].front.blocks);
  }, [design]);

  const updateFrontText = (id: string, text: string) => {
    setFrontEditableBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text } : b))
    );
  };

  const getBlocksFor = (s: Side) =>
    s === "front" ? frontEditableBlocks : editableBlocks;

  useEffect(() => {
    const canvasW = canvasRef.current?.clientWidth ?? null;
    const previewW = previewWrapRef.current?.clientWidth ?? null;

    console.log("[SCALE]", {
      isPreview,
      design,
      side,
      activeTab,
      canvasW,
      previewW,
      scale,
      previewScale,
    });
  }, [
    isPreview,
    design,
    side,
    activeTab,
    scale,
    previewScale,
    canvasRef,
    previewWrapRef,
  ]);

  const sheetTitle =
    activeTab === "design"
      ? "デザイン"
      : activeTab === "text"
      ? "テキスト"
      : activeTab === "export"
      ? "書き出し"
      : "編集";

  return (
    <div className="relative h-full w-full bg-[#eef4ff]">
      {/* ★ヘッダー分(56px)は上に空ける */}
      <div className="fixed left-0 top-14 z-40 h-[calc(100vh-56px)] w-14 border-r bg-white/70 backdrop-blur hidden xl:block">
        <Toolbar activeTab={activeTab} onChange={onChangeTab} />
      </div>
      <div className="hidden xl:block">
        {/* Desktop: xl以上は左パネル */}
        <ToolPanel
           variant="desktop"
          open={activeTab !== null}
          onClose={() => setActiveTab(null)}
          activeTab={activeTab}
          side={side}
          onChangeSide={setSide}
          blocks={getBlocksFor(side)}
          isPreview={isPreview}
          onChangeText={(id, value) =>
            side === "front"
              ? updateFrontText(id, value)
              : updateText(id, value)
          }
          onTogglePreview={() => setIsPreview((v) => !v)}
          design={design}
          onChangeDesign={setDesign}
          fontFamily="default"
          onDownload={(format, d) => downloadImage(format, d)}
        />
      </div>

      {/* Mobile/Tablet: xl未満はボトムシート */}
      <div className="xl:hidden">
        <BottomSheet
          open={activeTab !== null}
          onClose={() => setActiveTab(null)}
          title={sheetTitle}
        >
          <ToolPanel
            variant="sheet"
            open={activeTab !== null}
            onClose={() => setActiveTab(null)}
            activeTab={activeTab}
            side={side}
            onChangeSide={setSide}
            blocks={getBlocksFor(side)}
            isPreview={isPreview}
            onChangeText={(id, value) =>
              side === "front"
                ? updateFrontText(id, value)
                : updateText(id, value)
            }
            onTogglePreview={() => setIsPreview((v) => !v)}
            design={design}
            onChangeDesign={setDesign}
            fontFamily="default"
            onDownload={(format, d) => downloadImage(format, d)}
          />
        </BottomSheet>
      </div>

      <CanvasArea innerRef={canvasRef} panelVisible={panelVisible}>
        {/* 表/裏トグル（キャンバス上） */}
        <div className="mb-5 hidden xl:flex items-center justify-center">
          <div className="inline-flex rounded-xl border bg-white/80 p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setSide("front")}
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
              onClick={() => setSide("back")}
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

        {/* ✅ ここがCanva化：1枚だけ表示 */}
        <section className="flex flex-col items-center gap-3">
          <p className="w-full max-w-[480px] text-sm text-zinc-600">
            {side === "front" ? "表面" : "裏面"}
            {isPreview ? "（プレビュー）" : "（編集）"}
          </p>

          <CardSurface
            blocks={getBlocksFor(side)}
            design={design}
            interactive={!isPreview}
            onBlockPointerDown={(e, id) => handlePointerDown(e, id, { scale })}
            cardRef={cardRef}
            blockRefs={blockRefs}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
            className={isPreview ? "shadow-lg" : ""}
          />

          {!isPreview && (
            <p className="w-full max-w-[480px] text-xs text-zinc-500">
              ※プレビュー時はドラッグできません。編集モードで配置を調整してください。
            </p>
          )}
        </section>
      </CanvasArea>

      <ModalPreview
        open={isPreview}
        onClose={() => setIsPreview(false)}
        title="プレビュー"
      >
        <div className="w-full flex justify-center">
          <div ref={previewWrapRef} className="w-full flex justify-center">
            <div
              className="overflow-hidden"
              style={{ width: scaledW, height: scaledH }}
            >
              <div
                style={{
                  width: PREVIEW_W,
                  height: PREVIEW_H,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                <CardSurface
                  blocks={getBlocksFor(side)}
                  design={design}
                  interactive={false}
                  className="shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </ModalPreview>
      {!isPreview && (
        <MobileBottomBar activeTab={activeTab} onChangeTab={onChangeTab} />
      )}
    </div>
  );
}

function CanvasArea({
  children,
  innerRef,
  panelVisible,
}: {
  children: React.ReactNode;
  innerRef: React.RefObject<HTMLDivElement | null>;
  panelVisible: boolean;
}) {
  return (
    <main
      className={[
        "ml-0",
        panelVisible ? "xl:ml-[416px]" : "xl:ml-14",
        "h-[calc(100vh-56px)]",
        "min-w-0 overflow-y-auto overflow-x-hidden",
        "px-3 sm:px-6 lg:px-10 py-8",
        "pb-24 xl:pb-0", // ✅ 追加：モバイル下バー分の余白
        "flex justify-center",
        "transition-[margin] duration-200 ease-out",
      ].join(" ")}
    >
      {/* ✅ ここでズレを相殺する */}
      <div
        className={[
          "w-full flex justify-center",
          "transition-transform duration-200 ease-out transform-gpu",
          panelVisible ? "xl:-translate-x-[180px]" : "translate-x-0",
        ].join(" ")}
      >
        <div ref={innerRef} className="w-full max-w-[480px] min-w-0">
          {children}
        </div>
      </div>
    </main>
  );
}

function MobileBottomBarItem({
  tab,
  label,
  activeTab,
  onChangeTab,
}: {
  tab: TabKey;
  label: string;
  activeTab: TabKey | null;
  onChangeTab: (tab: TabKey) => void;
}) {
  const active = activeTab === tab;

  return (
    <button
      type="button"
      onClick={() => onChangeTab(tab)}
      className={[
        "flex flex-1 flex-col items-center justify-center gap-1 py-2",
        active ? "text-blue-700" : "text-zinc-600",
      ].join(" ")}
    >
      {/* いったん仮アイコン（四角） */}
      <span
        className={[
          "h-6 w-6 rounded-md",
          active ? "bg-blue-600/15" : "bg-zinc-900/5",
        ].join(" ")}
      />
      <span className="text-[11px]">{label}</span>
    </button>
  );
}

function MobileBottomBar({
  activeTab,
  onChangeTab,
}: {
  activeTab: TabKey | null;
  onChangeTab: (tab: TabKey) => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 xl:hidden">
      <div className="border-t bg-white/90 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-14 max-w-[520px]">
          <MobileBottomBarItem
            tab="design"
            label="デザイン"
            activeTab={activeTab}
            onChangeTab={onChangeTab}
          />
          <MobileBottomBarItem
            tab="text"
            label="テキスト"
            activeTab={activeTab}
            onChangeTab={onChangeTab}
          />
          <MobileBottomBarItem
            tab="export"
            label="書き出し"
            activeTab={activeTab}
            onChangeTab={onChangeTab}
          />
        </div>
      </div>
    </div>
  );
}

function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="absolute bottom-0 left-0 w-full rounded-t-2xl bg-white shadow-xl">
        {/* ヘッダー（固定） */}
        <div className="sticky top-0 z-10 rounded-t-2xl bg-white/90 backdrop-blur">
          <div className="mx-auto w-12 pt-2">
            <div className="h-1.5 w-full rounded-full bg-zinc-300" />
          </div>

          <div className="flex items-center justify-between px-4 pt-2 pb-3">
            <div className="text-sm font-semibold text-zinc-800">
              {title ?? "編集"}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-900/5"
            >
              閉じる
            </button>
          </div>

          <div className="h-px bg-zinc-200" />
        </div>

        {/* 本体（スクロール） */}
        <div className="max-h-[70vh] overflow-y-auto px-4 pt-3 pb-24">
          {children}
        </div>
      </div>
    </div>
  );
}
