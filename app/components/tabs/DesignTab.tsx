"use client";

import type { DesignKey } from "@/shared/design";

type Props = {
  value: DesignKey;
  onChange: (next: DesignKey) => void;
};

export default function DesignTab({ value, onChange }: Props) {
  return (
    <div className="space-y-3 pt-4 text-sm">
      <p>カードの背景デザインを選択してください。</p>

      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => onChange("plain")}
          className={`rounded border px-3 py-2 ${
            value === "plain"
              ? "border-blue-500 bg-blue-50"
              : "hover:bg-zinc-100"
          }`}
        >
          シンプル
        </button>

        <button
          type="button"
          onClick={() => onChange("girl")}
          className={`rounded border px-3 py-2 ${
            value === "girl"
              ? "border-blue-500 bg-blue-50"
              : "hover:bg-zinc-100"
          }`}
        >
          女の子イラスト
        </button>

        <button
          type="button"
          onClick={() => onChange("kinmokusei")}
          className={`rounded border px-3 py-2 ${
            value === "kinmokusei"
              ? "border-blue-500 bg-blue-50"
              : "hover:bg-zinc-100"
          }`}
        >
          金木犀
        </button>

        <button
          type="button"
          onClick={() => onChange("usaCarrot")}
          className={`rounded border px-3 py-2 ${
            value === "usaCarrot"
              ? "border-blue-500 bg-blue-50"
              : "hover:bg-zinc-100"
          }`}
        >
          うさぎ＆にんじん
        </button>
      </div>
    </div>
  );
}
