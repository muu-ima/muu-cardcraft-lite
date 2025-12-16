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
  }, [isPreview, design, side, activeTab, scale, previewScale, canvasRef, previewWrapRef]);

  return (
    <div className="relative h-full w-full bg-[#eef4ff]">
      {/* ★ヘッダー分(56px)は上に空ける */}
      <div className="fixed left-0 top-14 z-40 h-[calc(100vh-56px)] w-14 border-r bg-white/70 backdrop-blur">
        <Toolbar activeTab={activeTab} onChange={onChangeTab} />
      </div>

      <ToolPanel
        open={activeTab !== null}
        onClose={() => setActiveTab(null)}  // ✅ここが重要
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

      <CanvasArea innerRef={canvasRef}>
        <section className={isPreview ? "space-y-12" : "space-y-10"}>
          {/* 表面 */}
          <div className={isPreview ? "opacity-80" : ""}>
            <p className="mb-2 text-sm text-zinc-600">表面</p>

            <CardSurface
              blocks={getBlocksFor("front")}
              design={design}
              interactive={false}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className={isPreview ? "shadow-lg" : ""}
            />
          </div>

          {/* 裏面 */}
          <div>
            <p className="mb-2 text-sm text-zinc-600">
              裏面{isPreview ? "（プレビュー）" : "（編集：ドラッグ可能）"}
            </p>

            <CardSurface
              blocks={getBlocksFor("back")}
              design={design}
              interactive={!isPreview}
              onBlockPointerDown={(e, id) => handlePointerDown(e, id, { scale })}
              cardRef={cardRef}
              blockRefs={blockRefs}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className={isPreview ? "ring-2 ring-blue-500/20 shadow-lg" : ""}
            />

            {!isPreview && (
              <p className="mt-2 text-xs text-zinc-500">
                ※プレビュー時はドラッグできません。編集モードで配置を調整してください。
              </p>
            )}
          </div>
        </section>
      </CanvasArea>

      <ModalPreview open={isPreview} onClose={() => setIsPreview(false)} title="プレビュー">
        <div className="w-full flex justify-center">
          <div ref={previewWrapRef} className="w-full flex justify-center">
            <div className="overflow-hidden" style={{ width: scaledW, height: scaledH }}>
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
}: {
  children: React.ReactNode;
  innerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <main className="ml-14 h-[calc(100vh-56px)] min-w-0 overflow-y-auto px-3 sm:px-6 lg:px-10 py-8">
      <div ref={innerRef} className="mx-auto w-full max-w-4xl">
        {children}
      </div>
    </main>
  );
}
