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
import MobileHeader from "@/app/components/editor/MobileHeader";
import ExportSurface from "@/app/components/ExportSurface";
import CenterToolbar from "@/app/components/editor/CenterToolbar";

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

  const [activeBlockId, setActiveBlockId] = useState<string>("name");
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
    addBlock,
    previewText,
    commitText,
    updateFont,
    updateTextStyle,
    bumpFontSize,
    handlePointerDown: dragPointerDown,
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
    previewText(id, value); // 入力中は set
  };

  const onCommitText = (id: string, value: string) => {
    if (side !== "front") return;
    commitText(id, value); // 確定は commit
  };

  const handleBlockPointerDown = (
    e: React.PointerEvent<Element>,
    blockId: string,
    opts: { scale: number }
  ) => {
    setActiveBlockId(blockId); // 選択
    dragPointerDown(e, blockId, opts); // ドラッグ（scale 重要）
  };

  const active = editableBlocks.find((b) => b.id === activeBlockId);

  const centerToolbarValue = active
    ? {
        fontKey: active.fontKey,
        fontSize: active.fontSize ?? 16,
        bold: active.fontWeight === "bold",
        align: "left" as const, // ← いったん固定（Blockに無いので）
      }
    : null;

  return (
    <div
      className="relative h-full w-full "
      style={{
        background:
          "linear-gradient(135deg, #eef3f8 0%, #f7eef2 55%, #eef4ff 100%)",
      }}
    >
      {/* ✅ Mobile Header（xl未満だけ表示） */}
      <MobileHeader
        isPreview={isPreview}
        onTogglePreview={() => {
          setIsPreview((v) => {
            const next = !v;
            if (next) setActiveTab(null);
            return next;
          });
        }}
        onUndo={undo}
        onRedo={redo}
        onHome={() => {
          // 例：とりあえず「タブを閉じる」でもOK
          setActiveTab(null);
          setIsPreview(false);
          setSide("front");
        }}
      />
      {/* ★ヘッダー分(56px)は上に空ける */}
      <div className="fixed left-0 top-14 z-40 h-[calc(100vh-56px)] w-14 border-r bg-white/70 backdrop-blur hidden xl:block">
        <Toolbar
          activeTab={activeTab}
          onChange={setActiveTab}
          onUndo={undo}
          onRedo={redo}
          isPreview={isPreview}
          onTogglePreview={() => {
            setIsPreview((v) => {
              const next = !v;
              if (next) setActiveTab(null); // ✅ プレビュー入ったらパネル閉じる（おすすめ）
              return next;
            });
          }}
        />
      </div>
      <div className="hidden xl:block">
        {/* Desktop: xl以上は左パネル */}
        <ToolPanel
          variant="desktop"
          open={activeTab !== null}
          onClose={() => setActiveTab(null)}
          activeTab={activeTab}
          activeBlockId={activeBlockId}
          side={side}
          onChangeSide={setSide}
          blocks={getBlocksFor(side)}
          onAddBlock={addBlock}
          isPreview={isPreview}
          onChangeText={onChangeText}
          onCommitText={onCommitText}
          onBumpFontSize={bumpFontSize}
          onChangeFont={updateFont}
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
            activeBlockId={activeBlockId}
            side={side}
            onChangeSide={setSide}
            blocks={getBlocksFor(side)}
            onAddBlock={addBlock}
            isPreview={isPreview}
            onChangeText={onChangeText}
            onCommitText={onCommitText}
            onChangeFont={updateFont}
            onBumpFontSize={bumpFontSize}
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

      <div className="pt-14 xl:pt-0">
        <CanvasArea innerRef={canvasRef} panelVisible={panelVisible}>
          {/* <div className="mb-3 flex w-full max-w-[480px] justify-end">
            <button
              type="button"
              onClick={() => setShowGuides((v) => !v)}
              className="rounded-lg border bg-white/80 px-3 py-1.5 text-sm text-zinc-700 hover:bg-white"
            >
              {showGuides ? "ガイド：ON" : "ガイド：OFF"}
            </button>
          </div> */}

          {/* 表/裏トグル（キャンバス上） */}
          {/* <div className="mb-5 hidden xl:flex items-center justify-center">
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
          </div> */}

          <CenterToolbar
            value={centerToolbarValue}
            activeTab={activeTab}
            onOpenTab={(tab) => onChangeTab(tab)}
            // ✅ ここが「存在する関数名」版
            onChangeFontSize={(next) => {
              if (side !== "front") return;
              if (!centerToolbarValue) return;

              // bumpFontSize が「差分」想定の可能性が高いので delta を渡す
              const delta = next - centerToolbarValue.fontSize;
              bumpFontSize(activeBlockId, delta);
            }}
            onToggleBold={() => {
              if (side !== "front") return;
              if (!active) return;
              updateTextStyle(activeBlockId, {
                fontWeight: active.fontWeight === "bold" ? "normal" : "bold",
              });
            }}
            onChangeAlign={(align) => {
              if (side !== "front") return;
              updateTextStyle(activeBlockId, { align });
            }}
            side={side}
            onChangeSide={setSide}
            showGuides={showGuides}
            onToggleGuides={() => setShowGuides((v) => !v)}
            disabled={isPreview}
          />
          <div className="mx-auto flex w-full max-w-[980px] justify-center pt-28">
            <div className="w-full flex justify-center">
              <EditorCanvas
                blocks={getBlocksFor(side)}
                design={design}
                scale={scale}
                isPreview={isPreview}
                showGuides={showGuides}
                onPointerDown={
                  side === "front" ? handleBlockPointerDown : undefined
                }
                activeBlockId={activeBlockId}
                cardRef={cardRef}
                blockRefs={blockRefs}
              />
            </div>
          </div>
        </CanvasArea>
      </div>
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
                activeBlockId={activeBlockId}
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
