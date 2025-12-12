// app/editor/components/Toolbar.tsx
"use client";

export default function Toolbar() {
  return (
    <aside className="hidden xl:block w-80 border-r dark:bg-neutral-900/90 p-4 space-y-4">
      {/* タイトル */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-1 py-6">ツール</h2>
        <p className="text-xs text-zinc-500">
          テキストやフォントをここから編集できます
        </p>
      </div>

      {/* テキストブロック */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          テキスト
        </h3>
        <button className="w-full rounded-lg border px-3 py-3 text-sm text-left hover:bg-zinc-100 dark:hover:bg-neutral-800">
          + テキストブロック追加（あとで実装）
        </button>
      </div>

      {/* フォント設定 */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          フォント
        </h3>
        <select className="w-full rounded-lg border px-3 py-2.5 text-sm dark:bg-neutral-800 dark:text-zinc-50">
          <option>デフォルト</option>
          <option>Zen Maru Gothic</option>
          <option>Noto Sans JP</option>
        </select>
      </div>

      {/* 将来ここに色・整列ツールなど追加できる */}
      {/* <div>…</div> */}
    </aside>
  );
}
