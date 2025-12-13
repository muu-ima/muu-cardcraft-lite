"use client";

import { useRef, useState } from "react";
import ModalPreview from "@/app/components/ModalPreview";
import Toolbar from "@/app/components/Toolbar";
import CardSurface from "@/app/components/CardSurface";
import ExportSurface from "@/app/components/ExportSurface";
import EditorTabs from "@/app/components/EditorTabs";
import TextTab from "@/app/components/tabs/TextTab";
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
    handleMouseDown,
    cardRef,
    blockRefs,
    downloadImage,
  } = useCardBlocks();

  const exportRef = useRef<HTMLDivElement | null>(null);

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
                      onBlockMouseDown={(e, id) =>
                        handleMouseDown(e, id, { disabled: isPreview, scale })
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
                <div className="space-y-3 pt-4 text-sm">
                  <p>カードの背景デザインを選択してください。</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDesign("plain")}
                      className={`rounded border px-3 py-2 ${
                        design === "plain"
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-zinc-100"
                      }`}
                    >
                      シンプル
                    </button>
                    <button
                      onClick={() => setDesign("girl")}
                      className={`rounded border px-3 py-2 ${
                        design === "girl"
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-zinc-100"
                      }`}
                    >
                      女の子イラスト
                    </button>
                    <button
                      onClick={() => setDesign("kinmokusei")}
                      className={`rounded border px-3 py-2 ${
                        design === "kinmokusei"
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-zinc-100"
                      }`}
                    >
                      金木犀
                    </button>
                    <button
                      onClick={() => setDesign("usaCarrot")}
                      className={`rounded border px-3 py-2 ${
                        design === "usaCarrot"
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-zinc-100"
                      }`}
                    >
                      うさぎ＆にんじん
                    </button>
                  </div>
                </div>
              )}

              {/* 書き出しタブ */}
              {activeTab === "export" && (
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-zinc-600">
                    仕上がった名刺を画像として書き出します。
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage("png", design)}
                      className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-white text-sm"
                    >
                      裏面をPNGダウンロード
                    </button>
                    <button
                      onClick={() => downloadImage("jpeg", design)}
                      className="flex-1 rounded-full bg-emerald-600 px-4 py-2 text-white text-sm"
                    >
                      裏面をJPEGダウンロード
                    </button>
                  </div>
                </div>
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

      {/* 書き出し専用DOM（画面外・scaleなし・常に 480x260） */}
      <ExportSurface ref={exportRef} blocks={blocks} design={design} />
    </>
  );
}
