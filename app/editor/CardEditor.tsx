"use client";

import React, { useRef, useState } from "react";
import ModalPreview from "@/app/components/ModalPreview";
import Toolbar from "@/app/components/Toolbar";
import CardSurface from "@/app/components/CardSurface";
import ToolPanel from "@/app/components/ToolPanel";
import CanvasArea from "@/app/components/editor/CanvasArea";
import BottomSheet from "@/app/components/editor/BottomSheet";
import MobileBottomBar from "@/app/components/editor/MobileBottomBar";
import EditorCanvas from "@/app/components/editor/EditorCanvas";
import ExportSurface from "@/app/components/ExportSurface";

import { useScaleToFit } from "@/hooks/useScaleToFit";
import { useCardBlocks } from "@/hooks/useCardBlocks";
import { useEditorLayout } from "@/hooks/useEditorLayout";
import { type DesignKey } from "@/shared/design";
import { CARD_FULL_DESIGNS } from "@/shared/cardDesigns";
import type { TabKey } from "@/shared/editor";
import { CARD_BASE_W, CARD_BASE_H } from "@/shared/print";

type Side = "front" | "back";

export default function CardEditor() {
  const [side, setSide] = useState<Side>("front");
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const { panelVisible, sheetTitle } = useEditorLayout({
    activeTab,
    isPreview,
  });
  const [design, setDesign] = useState<DesignKey>("plain");
  const [showGuides, setShowGuides] = useState(true);
  const exportRef = useRef<HTMLDivElement | null>(null);

  // ✅ 同じタブ押し = 閉じる / 別タブ = 切替
  const onChangeTab = (tab: TabKey) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  // ★ CanvasArea内の幅でスケール作る（表面/裏面 共通）
  const { ref: canvasRef, scale } = useScaleToFit(CARD_BASE_W, true);

  const {
    blocks: editableBlocks,
    updateText,
    handlePointerDown,
    cardRef,
    blockRefs,
    downloadImage,
    undo,
    redo,
  } = useCardBlocks();

  const getBlocksFor = (s: Side) =>
    s === "front"
      ? editableBlocks // ← 編集できる真実を表へ
      : CARD_FULL_DESIGNS[design].back.blocks; // ← 裏は固定

  const onChangeText = (id: string, value: string) => {
    if (side !== "front") return;
    updateText(id, value);
  };

  return (
    <div className="relative h-full w-full bg-[#eef4ff]">
      {/* ★ヘッダー分(56px)は上に空ける */}
      <div className="fixed left-0 top-14 z-40 h-[calc(100vh-56px)] w-14 border-r bg-white/70 backdrop-blur hidden xl:block">
        <Toolbar
          activeTab={activeTab}
          onChange={onChangeTab}
          onUndo={undo}
          onRedo={redo}
        />
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
          onChangeText={onChangeText}
          onTogglePreview={() => setIsPreview((v) => !v)}
          design={design}
          onChangeDesign={setDesign}
          fontFamily="default"
          onDownload={(format) => {
            if (!exportRef.current) return;
            downloadImage(format, exportRef.current);
          }}
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
            onChangeText={onChangeText}
            onTogglePreview={() => setIsPreview((v) => !v)}
            design={design}
            onChangeDesign={setDesign}
            fontFamily="default"
            onDownload={(format) => {
              if (!exportRef.current) return;
              downloadImage(format, exportRef.current);
            }}
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
          onPointerDown={side === "front" ? handlePointerDown : undefined}
          cardRef={cardRef}
          blockRefs={blockRefs}
        />
      </CanvasArea>
      <ModalPreview
        open={isPreview}
        onClose={() => setIsPreview(false)}
        title="プレビュー"
      >
        {({ scale }) => (
          <div
            style={{ width: CARD_BASE_W * scale, height: CARD_BASE_H * scale }}
          >
            <div
              style={{
                width: CARD_BASE_W,
                height: CARD_BASE_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <CardSurface
                blocks={getBlocksFor(side)}
                design={design}
                w={CARD_BASE_W}
                h={CARD_BASE_H}
                interactive={false}
                className="shadow-lg"
              />
            </div>
          </div>
        )}
      </ModalPreview>

      {!isPreview && (
        <MobileBottomBar activeTab={activeTab} onChangeTab={onChangeTab} />
      )}
      <ExportSurface
        ref={exportRef}
        blocks={getBlocksFor(side)}
        design={design}
      />
    </div>
  );
}
