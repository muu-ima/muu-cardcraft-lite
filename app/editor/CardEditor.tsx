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
  const [side, setSide] = useState<"front" | "back">("back");
  const sideLabel = side === "front" ? "表面" : "裏面";
  const [activeTab, setActiveTab] = useState<TabKey>("text");
  const [fontFamily, setFontFamily] = useState("default");
  const [isPreview, setIsPreview] = useState(false);
  const [design, setDesign] = useState<DesignKey>("plain");
  const activeDesign = CARD_FULL_DESIGNS[design];

  // 表面用（常時）
  const { ref: frontWrapRef, scale: frontScale } = useScaleToFit(480, true);

  // 裏面用（今あるやつ）
  const { ref: wrapRef, scale } = useScaleToFit(480, true);

  // プレビュー用（モーダル開いてる時だけ動く）
  const { ref: previewWrapRef, scale: previewScale } = useScaleToFit(
    480,
    isPreview
  );

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

  // 裏面は hook の editableBlocks が唯一の真実
  const getBlocksFor = (s: Side) =>
    s === "front" ? frontEditableBlocks : editableBlocks;

  console.log("[SCALE]", { isPreview, frontScale, scale, previewScale });

  return (
    <div className="flex h-screen w-full bg-[#eef4ff]">
      <Toolbar activeTab={activeTab} onChange={setActiveTab} />

      <ToolPanel
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
        fontFamily={fontFamily}
        onDownload={(format, d) => downloadImage(format, d)}
      />

      <CanvasArea>
        <section className={isPreview ? "space-y-12" : "space-y-10"}>
          {/* 表面 */}
          <div className={isPreview ? "opacity-80" : ""}>
            <p className="mb-2 text-sm text-zinc-600">表面</p>
            <div ref={frontWrapRef} className="w-full">
              <CardSurface
                blocks={getBlocksFor("front")}
                design={design}
                interactive={false}
                style={{
                  transform: `scale(${frontScale})`,
                  transformOrigin: "top left",
                }}
                className={isPreview ? "shadow-lg" : ""}
              />
            </div>
          </div>

          {/* 裏面 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-zinc-600">
                裏面{isPreview ? "（プレビュー）" : "（編集：ドラッグ可能）"}
              </p>
            </div>

            <div ref={wrapRef} className="w-full">
              <CardSurface
                blocks={getBlocksFor("back")}
                design={design}
                interactive={!isPreview}
                onBlockPointerDown={(e, id) =>
                  handlePointerDown(e, id, { scale })
                }
                cardRef={cardRef}
                blockRefs={blockRefs}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
                className={isPreview ? "ring-2 ring-blue-500/20 shadow-lg" : ""}
              />
            </div>

            {!isPreview && (
              <p className="mt-2 text-xs text-zinc-500">
                ※プレビュー時はドラッグできません。編集モードで配置を調整してください。
              </p>
            )}
          </div>
        </section>
      </CanvasArea>

      <ModalPreview
        open={isPreview}
        onClose={() => setIsPreview(false)}
        title="プレビュー"
      >
        <div ref={previewWrapRef} className="w-full flex justify-center">
          <CardSurface
            blocks={getBlocksFor(side)}
            design={design}
            interactive={false}
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
            }}
            className="shadow-lg"
          />
        </div>
      </ModalPreview>
    </div>
  );
}

function CanvasArea({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto px-10 py-8">
      <div className="mx-auto w-full max-w-4xl">{children}</div>
    </main>
  );
}
