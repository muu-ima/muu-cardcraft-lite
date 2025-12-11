"use client";

import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {title ?? "プレビュー"}
          </h2>
          <button
            onClick={onClose}
            className="text-xl leading-none text-zinc-500 hover:text-zinc-800"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex justify-center">
          {children}
        </div>

        {/* フッター */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full border px-4 py-2 text-sm hover:bg-zinc-100"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
