"use client";

import type { Block } from "@/shared/blocks";

type Props = {
  blocks: Block[];
  isPreview: boolean;
  onAddBlock: () => void;
  onChangeText?: (id: string, value: string) => void; // ← optionalに
  canEdit?: boolean; // あってもいい（なくてもOK）
  onBumpFontSize?: (id: string, delta: number) => void;
};

export default function TextTab({
  blocks,
  isPreview,
  onAddBlock,
  onChangeText,
  onBumpFontSize,
}: Props) {
  return (
    <div className="space-y-4 pt-2">
      {/* 追加ボタン */}
      <button
        onClick={onAddBlock}
        className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
      >
        ＋ テキストを追加
      </button>
      {blocks.map((block, index) => (
        <div key={block.id}>
          <label className="text-sm text-zinc-700 dark:text-zinc-200">
            テキスト{index + 1}
          </label>
          <textarea
            value={block.text}
            onChange={(e) => onChangeText?.(block.id, e.target.value)}
            disabled={isPreview}
            rows={3}
            className="mt-1 w-full resize-y rounded border px-3 py-2 text-sm dark:bg-neutral-800 dark:text-zinc-50"
          />
          <button
            type="button"
            disabled={isPreview || !onBumpFontSize}
            onClick={() => onBumpFontSize?.(block.id, -2)}
          >
            −
          </button>

          <div>{block.fontSize}</div>

          <button
            type="button"
            disabled={isPreview || !onBumpFontSize}
            onClick={() => onBumpFontSize?.(block.id, +2)}
          >
            ＋
          </button>
        </div>
      ))}

     
    </div>
  );
}
