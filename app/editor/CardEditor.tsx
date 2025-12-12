"use client";

import { useState, type CSSProperties } from "react";
import ModalPreview from "@/app/components/ModalPreview";
import Toolbar from "@/app/components/Toolbar";
import { DesignKey, useCardBlocks } from "@/hooks/useCardBlocks";

function getCardStyle(design: DesignKey): CSSProperties {
  switch (design) {
    case "girl":
      return {
        backgroundImage: 'url("/girl.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    case "kinmokusei":
      return {
        backgroundImage: 'url("/kinmokusei.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    case "usaCarrot":
      return {
        backgroundImage: 'url("/usa-carrot.png")',
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "#ffffff",
      };
    case "plain":
    default:
      return { backgroundColor: "#e2c7a3" };
  }
}

export default function CardEditor() {
  const [activeTab, setActiveTab] = useState<
    "text" | "font" | "design" | "export"
  >("text");
  const [fontFamily, setFontFamily] = useState("default");
  const [isPreview, setIsPreview] = useState(false);
  const [design, setDesign] = useState<DesignKey>("plain");

  const { blocks, updateText, handleMouseDown, cardRef, blockRefs, downloadImage } =
    useCardBlocks();

  return (
    <div className="flex min-h-screen w-full font-sans dark:bg-black">
      {/* 左：ツールバー */}
      <Toolbar />

      {/* 右：エディタ領域 */}
      <div className="flex-1 flex items-center justify-center">
        <main className="flex min-h-screen w-full max-w-5xl flex-col items-center gap-10 py-16 px-6 dark:bg-neutral-900 lg:flex-row sm:items-start">
          {/* 左：プレビュー（表面＋裏面） */}
          <section className="w-full flex-1 flex justify-center">
            <div className="space-y-6">
              <p className="text-sm text-zinc-600">表面（サンプル）</p>

              <div className="relative w-[480px] h-[260px] rounded-xl border bg-[#e2c7a3] shadow-md flex items-center justify-center dark:bg-neutral-800">
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

              <div
                ref={cardRef}
                style={getCardStyle(design)}
                className="relative w-[480px] h-[260px] rounded-xl border shadow-md overflow-hidden"
              >
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    ref={(el) => {
                      blockRefs.current[block.id] = el;
                    }}
                    onMouseDown={(e) =>
                      handleMouseDown(e, block.id, { disabled: isPreview })
                    }
                    style={{
                      top: block.y,
                      left: block.x,
                      cursor: isPreview ? "default" : "move",
                    }}
                    className={`absolute select-none whitespace-nowrap text-zinc-900 dark:text-zinc-50 ${
                      block.fontWeight === "bold" ? "font-bold" : "font-normal"
                    }`}
                  >
                    <span style={{ fontSize: `${block.fontSize}px` }}>
                      {block.text}
                    </span>
                  </div>
                ))}
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
            <div className="flex text-sm border-b">
              <button
                onClick={() => setActiveTab("text")}
                className={`px-4 py-2 border-b-2 -mb-px ${
                  activeTab === "text"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                テキスト
              </button>
              <button
                onClick={() => setActiveTab("font")}
                className={`px-4 py-2 border-b-2 -mb-px ${
                  activeTab === "font"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                フォント
              </button>
              <button
                onClick={() => setActiveTab("design")}
                className={`px-4 py-2 border-b-2 -mb-px ${
                  activeTab === "design"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                カード背景
              </button>
              <button
                onClick={() => setActiveTab("export")}
                className={`px-4 py-2 border-b-2 -mb-px ${
                  activeTab === "export"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                書き出し
              </button>
            </div>

            {/* テキストタブ */}
            {activeTab === "text" && (
              <div className="space-y-4 pt-2">
                {blocks.map((block, index) => (
                  <div key={block.id}>
                    <label className="text-sm text-zinc-700 dark:text-zinc-200">
                      テキスト{index + 1}
                    </label>
                    <input
                      value={block.text}
                      onChange={(e) => updateText(block.id, e.target.value)}
                      disabled={isPreview}
                      className="mt-1 w-full rounded border px-3 py-2 text-sm dark:bg-neutral-800 dark:text-zinc-50"
                    />
                  </div>
                ))}

                <button
                  onClick={() => setIsPreview((prev) => !prev)}
                  className="w-full rounded-full border px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-neutral-800 dark:text-zinc-50"
                >
                  {isPreview ? "編集モードに戻る" : "プレビュー表示"}
                </button>
              </div>
            )}

            {/* デザインタブ（例） */}
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

            {/* フォント・書き出しタブは今のままでOK（downloadImage はそのまま使って大丈夫） */}
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
        <div
          style={getCardStyle(design)}
          className="relative w-[480px] h-[260px] rounded-xl border shadow-md overflow-hidden"
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              style={{ top: block.y, left: block.x }}
              className={`absolute select-none whitespace-nowrap text-zinc-900 dark:text-zinc-50 ${
                block.fontWeight === "bold" ? "font-bold" : "font-normal"
              }`}
            >
              <span style={{ fontSize: `${block.fontSize}px` }}>
                {block.text}
              </span>
            </div>
          ))}
        </div>
      </ModalPreview>
    </div>
  );
}
