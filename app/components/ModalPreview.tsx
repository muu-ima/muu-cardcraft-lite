"use client";

import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function ModalPreview({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold sm:text-base">
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

        {/* Body (ここだけ伸び縮み＆必要ならスクロール) */}
        <div className="flex-1 overflow-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="w-full flex items-center justify-center">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex justify-end">
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
