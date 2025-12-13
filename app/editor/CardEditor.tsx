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

export default function CardEditor() {
  const [activeTab, setActiveTab] = useState<
    "text" | "font" | "design" | "export"
  >("text");
  const [fontFamily, setFontFamily] = useState("default");
  const [isPreview, setIsPreview] = useState(false);
  const [design, setDesign] = useState<DesignKey>("plain");

  // 編集用
  const { ref: wrapRef, scale } = useScaleToFit(480, true);

  // プレビュー用（モーダル開いてる時だけ動く）
  const { ref: previewWrapRef, scale: previewScale } = useScaleToFit(
    480,
    isPreview
  );

  const {
    blocks,
    updateText,
    handlePointerDown,
    cardRef,
    blockRefs,
    downloadImage,
  } = useCardBlocks();

  return (
    <>
      <div className="flex min-h-screen w-full font-sans dark:bg-black">
        <Toolbar />

        <div className="flex-1 flex items-center justify-center">
          <main className="flex min-h-screen w-full max-w-5xl flex-col items-center gap-10 py-16 px-6 dark:bg-neutral-900 lg:flex-row sm:items-start">
            {/* 左：プレビュー（表面＋裏面） */}
            <section className="w-full flex-1 flex justify-center">
              <div className="space-y-6">
                <p className="text-sm text-zinc-600">表面（サンプル）</p>

                <div className="relative w-full max-w-[480px] aspect-480/260 rounded-xl border bg-[#e2c7a3] shadow-md flex items-center justify-center dark:bg-neutral-800">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-zinc-900/40 dark:border-zinc-50/40 flex items-center justify-center text-xs">
                      Logo
                    </div>
                    <span className="text-xs text-zinc-700 dark:text-zinc-200">
                      ブランドロゴのみ / テキスト編集不可
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-zinc-600">
                  裏面（テキスト編集・ドラッグ可能）
                </p>

                {/* B：見た目サイズ枠（縮む） */}
                <div
                  ref={wrapRef}
                  className="relative w-full max-w-[480px]"
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
                      blocks={blocks}
                      design={design}
                      interactive={!isPreview}
                      cardRef={cardRef}
                      blockRefs={blockRefs}
                      onBlockPointerDown={(e, id) =>
                        handlePointerDown(e, id, { disabled: isPreview, scale })
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
                  blocks={blocks}
                  isPreview={isPreview}
                  onChangeText={updateText}
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
          title="名刺プレビュー（裏面）"
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
                <CardSurface blocks={blocks} design={design} />
              </div>
            </div>
          </div>
        </ModalPreview>
      </div>
    </>
  );
}
