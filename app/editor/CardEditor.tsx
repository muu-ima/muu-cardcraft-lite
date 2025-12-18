"use client";

import React, { useEffect, useState } from "react";
import ModalPreview from "@/app/components/ModalPreview";
import Toolbar from "@/app/components/Toolbar";
import CardSurface from "@/app/components/CardSurface";
import ToolPanel from "@/app/components/ToolPanel";
import CanvasArea from "@/app/components/editor/CanvasArea";
import BottomSheet from "@/app/components/editor/BottomSheet";
import MobileBottomBar from "@/app/components/editor/MobileBottomBar";
import EditorCanvas from "@/app/components/editor/EditorCanvas";

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
  const [showGuides, setShowGuides] = useState(true);

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
        <div className="mb-3 flex w-full max-w-[480px] justify-end">
          <button
            type="button"
            onClick={() => setShowGuides((v) => !v)}
            className="rounded-lg border bg-white/80 px-3 py-1.5 text-sm text-zinc-700 hover:bg-white"
          >
            {showGuides ? "ガイド：ON" : "ガイド：OFF"}
          </button>
        </div>

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

        <EditorCanvas
          blocks={getBlocksFor(side)}
          design={design}
          scale={scale}
          isPreview={isPreview}
          showGuides={showGuides}
          onPointerDown={handlePointerDown}
          cardRef={cardRef}
          blockRefs={blockRefs}
        />
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
