"use client";

import { useState } from "react";
import ModalPreview from "@/app/components/ModalPreview";
import Toolbar from "@/app/components/Toolbar";
import CardSurface from "@/app/components/CardSurface";
import EditorTabs from "@/app/components/EditorTabs";
import TextTab from "@/app/components/tabs/TextTab";
import DesignTab from "@/app/components/tabs/DesignTab";
import ExportTab from "@/app/components/tabs/ExportTab";

import { useScaleToFit } from "@/hooks/useScaleToFit";
import { useCardBlocks } from "@/hooks/useCardBlocks";
import { type DesignKey } from "@/shared/design";
import { CARD_FULL_DESIGNS } from "@/shared/cardDesigns";

export default function CardEditor() {
  const [side, setSide] = useState<"front" | "back">("back");
  const [activeTab, setActiveTab] = useState<
    "text" | "font" | "design" | "export"
  >("text");
  const [fontFamily, setFontFamily] = useState("default");
  const [isPreview, setIsPreview] = useState(false);
  const [design, setDesign] = useState<DesignKey>("plain");

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

  const activeDesign = CARD_FULL_DESIGNS[design];
  const frontBlocks = activeDesign.front.blocks;
  const backBlocks = editableBlocks; // ←裏面の編集データ（唯一の真実）

  // 右パネル / プレビュー / 書き出しで「対象」を切り替える
  const blocksForSide = side === "front" ? frontBlocks : backBlocks;
  const canEditText = side === "back";

  const previewTitle =
    side === "front" ? "名刺プレビュー（表面）" : "名刺プレビュー（裏面）";
  const previewBlocks = side === "front" ? frontBlocks : editableBlocks;

  return (
    <>
      <div className="flex min-h-screen w-full font-sans dark:bg-black">
        <Toolbar />
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setSide("front")}
            className={`px-4 py-2 rounded ${
              side === "front"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-200 text-zinc-700"
            }`}
          >
            表面
          </button>
          <button
            onClick={() => setSide("back")}
            className={`px-4 py-2 rounded ${
              side === "back"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-200 text-zinc-700"
            }`}
          >
            裏面
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <main className="flex min-h-screen w-full max-w-5xl flex-col items-center gap-10 py-16 px-6 dark:bg-neutral-900 lg:flex-row sm:items-start">
            {/* 左：プレビュー（表面＋裏面） */}
            <section className="w-full flex-1 min-w-0 flex justify-center">
              <div className="space-y-6">
                <p className="text-sm text-zinc-600">表面</p>

                <div
                  ref={frontWrapRef}
                  className="relative w-full max-w-[480px] min-w-0 mx-auto"
                  style={{ aspectRatio: "480 / 260" }}
                >
                  <div
                    style={{
                      width: 480,
                      height: 260,
                      transform: `scale(${frontScale})`,
                      transformOrigin: "top left",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <CardSurface blocks={frontBlocks} design={design} />
                  </div>
                </div>

                <p className="mt-4 text-sm text-zinc-600">
                  裏面（テキスト編集・ドラッグ可能）
                </p>

                {/* B：見た目サイズ枠（縮む） */}
                <div
                  ref={wrapRef}
                  className="relative w-full max-w-[480px] min-w-0 mx-auto"
                  style={{ aspectRatio: "480 / 260" }}
                >
                  <div
                    style={{
                      width: 480,
                      height: 260,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <CardSurface
                      blocks={editableBlocks} // ★ 常に裏面（作業場）
                      design={design}
                      interactive={!isPreview} // ★ side に依存しない
                      cardRef={cardRef}
                      blockRefs={blockRefs}
                      onBlockPointerDown={
                        !isPreview
                          ? (e, id) =>
                              handlePointerDown(e, id, {
                                disabled: isPreview,
                                scale,
                              })
                          : undefined
                      }
                    />
                  </div>
                </div>

                <p className="text-xs text-zinc-500">
                  ※プレビュー時はドラッグできません。編集モードで配置を調整してください。
                </p>
              </div>
            </section>

            {/* 右：インスペクタ */}
            <section className="w-full max-w-md space-y-4 lg:mx-auto">
              <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                シンプルデザイン（裏面デザイン）
              </h1>

              {/* タブヘッダー */}
              <EditorTabs activeTab={activeTab} onChange={setActiveTab} />

              {/* テキストタブ */}
              {activeTab === "text" && (
                <TextTab
                  blocks={blocksForSide}
                  isPreview={isPreview}
                  canEdit={canEditText} // ← これがあるとUXが綺麗
                  onChangeText={canEditText ? updateText : undefined}
                  onTogglePreview={() => setIsPreview((p) => !p)}
                />
              )}

              {/* デザインタブ */}
              {activeTab === "design" && (
                <DesignTab value={design} onChange={setDesign} />
              )}

              {/* 書き出しタブ */}
              {activeTab === "export" && (
                <ExportTab
                  design={design}
                  fontFamily={fontFamily} // 使わないなら消す
                  onDownload={downloadImage}
                />
              )}
            </section>
          </main>
        </div>

        {/* プレビューモーダル */}
        <ModalPreview
          open={isPreview}
          onClose={() => setIsPreview(false)}
          title={previewTitle}
        >
          <div ref={previewWrapRef} className="w-full max-w-[480px] min-w-0">
            <div
              className="relative mx-auto"
              style={{ width: 480 * previewScale, height: 260 * previewScale }}
            >
              <div
                style={{
                  width: 480,
                  height: 260,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <CardSurface blocks={previewBlocks} design={design} />
              </div>
            </div>
          </div>
        </ModalPreview>
      </div>
    </>
  );
}
