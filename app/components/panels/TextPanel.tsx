"use client";

import type { Block } from "@/shared/blocks";
import TextTab from "@/app/components/tabs/TextTab";

type Side = "front" | "back";

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white/70 backdrop-blur p-4
      shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_18px_rgba(0,0,0,0.06)]"
    >
      <div className="mb-3">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        {desc && <p className="mt-1 text-xs text-zinc-500">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

function SideToggle({
  side,
  onChangeSide,
}: {
  side: Side;
  onChangeSide: (s: Side) => void;
}) {
  return (
    <div className="inline-flex rounded-xl bg-white/60 backdrop-blur p-1
      shadow-[0_1px_0_rgba(0,0,0,0.08)]"
    >
      <button
        type="button"
        onClick={() => onChangeSide("front")}
        className={[
          "px-3 py-1.5 text-sm rounded-lg transition",
          side === "front"
            ? "bg-pink-500/15 text-pink-700"
            : "text-zinc-600 hover:bg-zinc-900/5",
        ].join(" ")}
      >
        表面
      </button>
      <button
        type="button"
        onClick={() => onChangeSide("back")}
        className={[
          "px-3 py-1.5 text-sm rounded-lg transition",
          side === "back"
            ? "bg-pink-500/15 text-pink-700"
            : "text-zinc-600 hover:bg-zinc-900/5",
        ].join(" ")}
      >
        裏面
      </button>
    </div>
  );
}

export default function TextPanel({
  side,
  onChangeSide,
  blocks,
  onAddBlock,
  isPreview,
  onChangeText,
  onBumpFontSize,
  onTogglePreview,
}: {
  side: Side;
  onChangeSide: (side: Side) => void;
  blocks: Block[];
  onAddBlock: () => void;
  isPreview: boolean;
  onChangeText: (id: string, value: string) => void;
  onBumpFontSize?: (id: string, delta: number) => void;
  onTogglePreview: () => void;
}) {
  return (
    <div className="space-y-4">
      <Section title="編集する面" desc="表面 / 裏面 を切り替えます。">
        <SideToggle side={side} onChangeSide={onChangeSide} />
      </Section>

      <Section title="テキスト編集" desc="内容を入力してプレビューで確認できます。">
        <TextTab
          blocks={blocks}
          isPreview={isPreview}
          onAddBlock={onAddBlock}
          onChangeText={onChangeText}
          onBumpFontSize={onBumpFontSize}
          onTogglePreview={onTogglePreview}
        />
      </Section>
    </div>
  );
}
