"use client";

import {
  Type,
  TextCursor,
  Image as ImageIcon,
  Download,
  Undo2,
  Redo2,
} from "lucide-react";
import type { TabKey } from "@/shared/editor";

type Props = {
  activeTab: TabKey | null;
  onChange: (tab: TabKey) => void;
  onUndo: () => void;
  onRedo: () => void;
};

const tools: { key: TabKey; label: string; Icon: React.ElementType }[] = [
  { key: "text", label: "文字", Icon: Type },
  { key: "font", label: "フォント", Icon: TextCursor },
  { key: "design", label: "背景", Icon: ImageIcon },
  { key: "export", label: "書き出し", Icon: Download },
];

export default function Toolbar({
  activeTab,
  onChange,
  onUndo,
  onRedo,
}: Props) {
  return (
    <aside
      className={[
        "hidden md:flex",
        "flex-col justify-between",
        "sticky top-0 h-screen",
        "w-16 shrink-0",
        // border-r をやめる
        "bg-white/60 backdrop-blur",
        // 右側に薄い陰影（線の代わり）
        "shadow-[1px_0_0_rgba(0,0,0,0.06)]",
        "px-2 py-3",
      ].join(" ")}
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
                  ? "bg-pink-500/15 text-pink-700"
                  : "text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-800",
                // キーボード操作も強く
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/35",
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

      {/* Undo / Redo */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onUndo}
          aria-label="元に戻す"
          className={[
            "group relative",
            "flex h-11 w-11 items-center justify-center rounded-xl",
            "transition",
            "text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
          ].join(" ")}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={22} strokeWidth={1.75} />
          <span
            className={[
              "pointer-events-none absolute left-14 top-1/2 -translate-y-1/2",
              "whitespace-nowrap rounded-md",
              "bg-zinc-900 px-2 py-1 text-xs text-white shadow",
              "opacity-0 translate-x-1",
              "transition group-hover:opacity-100 group-hover:translate-x-0",
            ].join(" ")}
          >
            元に戻す
          </span>
        </button>

        <button
          type="button"
          onClick={onRedo}
          aria-label="やり直し"
          className={[
            "group relative",
            "flex h-11 w-11 items-center justify-center rounded-xl",
            "transition",
            "text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
          ].join(" ")}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={22} strokeWidth={1.75} />
          <span
            className={[
              "pointer-events-none absolute left-14 top-1/2 -translate-y-1/2",
              "whitespace-nowrap rounded-md",
              "bg-zinc-900 px-2 py-1 text-xs text-white shadow",
              "opacity-0 translate-x-1",
              "transition group-hover:opacity-100 group-hover:translate-x-0",
            ].join(" ")}
          >
            やり直し
          </span>
        </button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onUndo}
          aria-label="元に戻す"
          title="Undo (Ctrl+Z)"
          className={[
            "group relative",
            "flex h-11 w-11 items-center justify-center rounded-xl",
            "text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
          ].join(" ")}
        >
          <Undo2 size={22} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={onRedo}
          aria-label="やり直し"
          title="Redo (Ctrl+Shift+Z)"
          className={[
            "group relative",
            "flex h-11 w-11 items-center justify-center rounded-xl",
            "text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
          ].join(" ")}
        >
          <Redo2 size={22} strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}
