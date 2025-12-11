"use client";

import { useEffect, useRef, useState } from "react";
import ModalPreview from "@/app/components/ModalPreview";

export default function Home() {
  // テキスト2つ
  const [text1, setText1] = useState("山田 太郎");
  const [text2, setText2] = useState("デザイナー / Designer");

  // 位置
  const [pos1, setPos1] = useState({ x: 100, y: 80 });
  const [pos2, setPos2] = useState({ x: 100, y: 120 });

  // ドラッグ
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<"text1" | "text2" | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // プレビュー
  const [isPreview, setIsPreview] = useState(false);

  // 裏面カード用の ref（ダウンロード対象）
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    target: "text1" | "text2"
  ) => {
    if (isPreview) return;

    e.preventDefault();
    setDragTarget(target);
    setIsDragging(true);

    const rect = cardRef.current!.getBoundingClientRect();
    const pos = target === "text1" ? pos1 : pos2;

    setOffset({
      x: e.clientX - rect.left - pos.x,
      y: e.clientY - rect.top - pos.y,
    });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging || !dragTarget || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - offset.x;
      const offsetY = e.clientY - rect.top - offset.y;

      const newX = Math.max(0, Math.min(rect.width - 20, offsetX));
      const newY = Math.max(0, Math.min(rect.height - 20, offsetY));

      if (dragTarget === "text1") {
        setPos1({ x: newX, y: newY });
      } else {
        setPos2({ x: newX, y: newY });
      }
    };

    const handleUp = () => {
      setIsDragging(false);
      setDragTarget(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging, dragTarget, offset]);

  // 📌 PNG/JPEG ダウンロード（裏面カード）
  const downloadImage = async (format: "png" | "jpeg") => {
    if (!cardRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = 480 * 2;
    canvas.height = 260 * 2;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);

    const rect = cardRef.current.getBoundingClientRect();
    const style = window.getComputedStyle(cardRef.current);

    // 背景
    ctx.fillStyle = style.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // テキスト1
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#1a1a1a";
    ctx.fillText(text1, pos1.x, pos1.y + 24);

    // テキスト2
    ctx.font = "18px sans-serif";
    ctx.fillText(text2, pos2.x, pos2.y + 18);

    const link = document.createElement("a");
    link.download = `card.${format}`;
    link.href =
      format === "png"
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", 0.92);

    link.click();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e9f6f0] font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center gap-10 py-16 px-6 bg-white dark:bg-neutral-900 lg:flex-row sm:items-start">
        {/* 左：プレビュー（表面＋裏面） */}
        <section className="w-full flex-1 flex justify-center">
          <div className="space-y-6">
            {/* 表面ラベル */}
            <p className="text-sm text-zinc-600">表面（サンプル）</p>

            {/* 表面カード：固定デザインのイメージ */}
            <div className="relative w-[480px] h-[260px] rounded-xl border bg-[#e2c7a3] shadow-md flex items-center justify-center dark:bg-neutral-800">
              {/* 実際はロゴ画像を置く想定 */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-zinc-900/40 dark:border-zinc-50/40 flex items-center justify-center text-xs">
                  Logo
                </div>
                <span className="text-xs text-zinc-700 dark:text-zinc-200">
                  ブランドロゴのみ / テキスト編集不可
                </span>
              </div>
            </div>

            {/* 裏面ラベル */}
            <p className="mt-4 text-sm text-zinc-600">
              裏面（テキスト編集・ドラッグ可能）
            </p>

            {/* 裏面カード：編集対象 */}
            <div
              ref={cardRef}
              className="relative w-[480px] h-[260px] rounded-xl border bg-[#e2c7a3] shadow-md dark:bg-neutral-800"
            >
              {/* テキスト1 */}
              <div
                onMouseDown={(e) => handleMouseDown(e, "text1")}
                style={{
                  top: pos1.y,
                  left: pos1.x,
                  cursor: isPreview ? "default" : "move",
                }}
                className="absolute text-xl font-bold text-zinc-900 dark:text-zinc-50 select-none"
              >
                {text1}
              </div>

              {/* テキスト2 */}
              <div
                onMouseDown={(e) => handleMouseDown(e, "text2")}
                style={{
                  top: pos2.y,
                  left: pos2.x,
                  cursor: isPreview ? "default" : "move",
                }}
                className="absolute text-lg text-zinc-900 dark:text-zinc-50 select-none"
              >
                {text2}
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              ※プレビュー時はドラッグできません。編集モードで配置を調整してください。
            </p>
          </div>
        </section>

        {/* 右：コントロール（フォーム） */}
        <section className="w-full max-w-md space-y-6 lg:mx-auto">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            シンプルデザイン（裏面デザイン）
          </h1>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-700 dark:text-zinc-200">
                文字1
              </label>
              <input
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                disabled={isPreview}
                className="mt-1 w-full rounded border px-3 py-2 text-sm dark:bg-neutral-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-700 dark:text-zinc-200">
                文字2
              </label>
              <input
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                disabled={isPreview}
                className="mt-1 w-full rounded border px-3 py-2 text-sm dark:bg-neutral-800 dark:text-zinc-50"
              />
            </div>

            <button
              onClick={() => setIsPreview((prev) => !prev)}
              className="w-full rounded-full border px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-neutral-800 dark:text-zinc-50"
            >
              {isPreview ? "編集モードに戻る" : "プレビュー表示"}
            </button>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => downloadImage("png")}
                className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-white text-sm"
              >
                裏面をPNGダウンロード
              </button>
              <button
                onClick={() => downloadImage("jpeg")}
                className="flex-1 rounded-full bg-emerald-600 px-4 py-2 text-white text-sm"
              >
                裏面をJPEGダウンロード
              </button>
            </div>
          </div>
        </section>
      </main>
      {/* 🔍 モーダル（main の外） */}
      <ModalPreview
        open={isPreview}
        onClose={() => setIsPreview(false)}
        title="名刺プレビュー（裏面）"
      >
        {/* ← 裏面カードの JSX をここに入れる */}
        <div className="relative w-[480px] h-[260px] rounded-xl border bg-[#e2c7a3] shadow-md dark:bg-neutral-800">
          <div
            style={{
              top: pos1.y,
              left: pos1.x,
            }}
            className="absolute text-xl font-bold text-zinc-900 dark:text-zinc-50 select-none"
          >
            {text1}
          </div>

          <div
            style={{
              top: pos2.y,
              left: pos2.x,
            }}
            className="absolute text-lg text-zinc-900 dark:text-zinc-50 select-none"
          >
            {text2}
          </div>
        </div>
      </ModalPreview>
    </div>
  );
}
