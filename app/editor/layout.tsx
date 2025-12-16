// app/editor/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#eef4ff]">
      {/* Editor Header */}
      <header className="h-14 w-full border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold">
              <span className="text-pink-500">Cocco</span> CardCraft
            </Link>
            <span className="text-xs text-zinc-500">Editor</span>
          </div>

          <nav className="flex items-center gap-4 text-sm text-zinc-700">
            <Link href="/editor" className="hover:underline">
              エディタ
            </Link>
            <Link href="/snapshots" className="hover:underline">
              スナップショット一覧（予定）
            </Link>
          </nav>
        </div>
      </header>

      {/* Editor Body */}
      <div className="h-[calc(100vh-56px)]">{children}</div>
    </div>
  );
}
