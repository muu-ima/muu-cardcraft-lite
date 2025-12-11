// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CardCraft - 名刺エディタ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-100 text-gray-900">
        {/* 共通ヘッダー */}
        <header className="w-full border-b bg-white">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
            <div className="font-bold">
              <span className="text-pink-500">Cocco</span> CardCraft
            </div>
            <nav className="flex gap-4 text-sm">
              <Link href="/editor">エディタ</Link>
              <Link href="/snapshots">スナップショット一覧（予定）</Link>
            </nav>
          </div>
        </header>

        {/* コンテンツ */}
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* 共通フッター */}
        <footer className="w-full border-t bg-white mt-8">
          <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-center text-gray-500">
            © {new Date().getFullYear()} Cocco Neil. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
