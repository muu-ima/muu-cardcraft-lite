"use client";

import { Type, TextCursor, Image as ImageIcon, Download } from "lucide-react";
import type { TabKey } from "@/shared/editor";

type Props = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

const tools: { key: TabKey; label: string; Icon: React.ElementType }[] = [
  { key: "text", label: "文字", Icon: Type },
  { key: "font", label: "フォント", Icon: TextCursor },
  { key: "design", label: "背景", Icon: ImageIcon },
  { key: "export", label: "書き出し", Icon: Download },
];

export default function Toolbar({ activeTab, onChange }: Props) {
  return (
    <aside
      className={[
        // 画面左・縦固定（Canva系）
        "hidden md:flex",
        "sticky top-0 h-screen",
        "w-16 shrink-0",
        "border-r bg-white/70 backdrop-blur",
        "px-2 py-3",
      ].join(" ")}
      aria-label="Editor Toolbar"
    >
      <div className="flex flex-col items-center gap-2">
        {tools.map(({ key, label, Icon }) => {
          const active = activeTab === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={[
                "group relative",
                "flex h-11 w-11 items-center justify-center rounded-xl",
                "transition",
                // Canvaっぽい hover の濃淡
                active
                  ? "bg-blue-600/10 text-blue-700"
                  : "text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-800",
                // キーボード操作も強く
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
              ].join(" ")}
            >
              <Icon size={22} strokeWidth={1.75} />

              {/* Tooltip */}
              <span
                className={[
                  "pointer-events-none absolute left-14 top-1/2 -translate-y-1/2",
                  "whitespace-nowrap rounded-md",
                  "bg-zinc-900 px-2 py-1 text-xs text-white shadow",
                  "opacity-0 translate-x-1",
                  "transition group-hover:opacity-100 group-hover:translate-x-0",
                ].join(" ")}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
