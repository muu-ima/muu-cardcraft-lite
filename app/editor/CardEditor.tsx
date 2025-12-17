"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="relative h-full w-full bg-[#eef4ff]">
      {/* ★ヘッダー分(56px)は上に空ける */}
      <div className="fixed left-0 top-14 z-40 h-[calc(100vh-56px)] w-14 border-r bg-white/70 backdrop-blur hidden xl:block">
        <Toolbar activeTab={activeTab} onChange={onChangeTab} />
      </div>

      <ToolPanel
        open={activeTab !== null}
        onClose={() => setActiveTab(null)} // ✅ここが重要
        activeTab={activeTab}
        side={side}
        onChangeSide={setSide}
        blocks={getBlocksFor(side)}
        isPreview={isPreview}
        onChangeText={(id, value) =>
          side === "front" ? updateFrontText(id, value) : updateText(id, value)
        }
        onTogglePreview={() => setIsPreview((v) => !v)}
        design={design}
        onChangeDesign={setDesign}
        fontFamily="default"
        onDownload={(format, d) => downloadImage(format, d)}
      />

      <CanvasArea innerRef={canvasRef} panelVisible={panelVisible}>
        {/* 表/裏トグル（キャンバス上） */}
        <div className="mb-5 flex items-center justify-center">
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
        "ml-0", // ✅ モバイルは常に0
        panelVisible ? "xl:ml-[416px]" : "xl:ml-14",
        "h-[calc(100vh-56px)]",
        "min-w-0 overflow-y-auto overflow-x-hidden",
        "min-w-0 overflow-y-auto",
        "px-3 sm:px-6 lg:px-10 py-8",
        "flex justify-center",
        "transition-[margin] duration-200 ease-out",
      ].join(" ")}
    >
      {/* ✅ ここでズレを相殺する */}
      <div
        className={[
          "w-full flex justify-center",
          "transition-transform duration-200 ease-out transform-gpu",
          panelVisible ? "md:-translate-x-[180px]" : "translate-x-0",
        ].join(" ")}
      >
        <div ref={innerRef} className="w-full max-w-[480px] min-w-0">
          {children}
        </div>
      </div>
    </main>
  );
}
