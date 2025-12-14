"use client";

import { useEffect, useState } from "react";
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

type Side = "front" | "back";

export default function CardEditor() {
  const [side, setSide] = useState<"front" | "back">("back");
  const sideLabel = side === "front" ? "表面" : "裏面";
  const [activeTab, setActiveTab] = useState<
    "text" | "font" | "design" | "export"
  >("text");
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

  return (
    <>
      <div className="flex min-h-screen w-full font-sans dark:bg-black">
        <Toolbar />

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
                    <CardSurface blocks={frontEditableBlocks} design={design} />
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
                      blocks={editableBlocks}
                      design={design}
                      interactive={!isPreview && side === "back"}
                      cardRef={cardRef}
                      blockRefs={blockRefs}
                      onBlockPointerDown={
                        !isPreview && side === "back"
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
            <section className="w-full space-y-4 lg:max-w-md lg:mx-auto">
              <div className="flex items-center justify-between gap-3">
                <h1
                  className="
                    text-lg          /* mobile */
                    sm:text-xl       /* small tablet */
                    lg:text-2xl      /* PC */
                    font-semibold
                    tracking-tight
                    text-black
                    dark:text-zinc-50
                  "
                >
                  シンプルデザイン
                  <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                    ({sideLabel})
                  </span>
                </h1>

                {/* 表/裏 トグル（小さく） */}
                <div className="inline-flex rounded-full bg-zinc-200 p-0.5 text-xs dark:bg-zinc-800">
                  <button
                    onClick={() => setSide("front")}
                    className={`px-3 py-1 rounded-full transition
                      ${
                        side === "front"
                          ? "bg-white text-zinc-900 shadow dark:bg-zinc-50"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                      }`}
                  >
                    表面
                  </button>

                  <button
                    onClick={() => setSide("back")}
                    className={`px-3 py-1 rounded-full transition
                ${
                  side === "back"
                    ? "bg-white text-zinc-900 shadow dark:bg-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                }`}
                  >
                    裏面
                  </button>
                </div>
              </div>

              {/* タブヘッダー */}
              <EditorTabs activeTab={activeTab} onChange={setActiveTab} />

              {/* テキストタブ */}
              {activeTab === "text" && (
                <TextTab
                  blocks={getBlocksFor(side)}
                  isPreview={isPreview}
                  canEdit={true}
                  onChangeText={side === "front" ? updateFrontText : updateText}
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
          title={
            side === "front" ? "名刺プレビュー(表面)" : "名刺プレビュー（裏面）"
          }
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
                <CardSurface blocks={getBlocksFor(side)} design={design} />
              </div>
            </div>
          </div>
        </ModalPreview>
      </div>
    </>
  );
}
