"use client";

import { FONT_DEFINITIONS, type FontKey } from "@/shared/fonts";

type Props = {
  value: FontKey;
  onChange: (font: FontKey) => void;
};

export default function FontTab({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      {Object.entries(FONT_DEFINITIONS).map(([key, def]) => {
        const fontKey = key as FontKey;

        return (
          <button
            key={fontKey}
            type="button"
            onClick={() => onChange(fontKey)}
            className={[
              "w-full rounded-xl border px-3 py-2 text-left transition",
              value === fontKey
                ? "border-pink-400 bg-pink-500/10"
                : "border-zinc-200 hover:bg-zinc-900/5",
            ].join(" ")}
            style={{ fontFamily: def.css }}
          >
            {def.label}
          </button>
        );
      })}
    </div>
  );
}
