//app/editor/components/BottomSheet.tsx
"use client";

import React from "react";

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="absolute bottom-0 left-0 w-full rounded-t-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 rounded-t-2xl bg-white/90 backdrop-blur">
          <div className="mx-auto w-12 pt-2">
            <div className="h-1.5 w-full rounded-full bg-zinc-300" />
          </div>

          <div className="flex items-center justify-between px-4 pt-2 pb-3">
            <div className="text-sm font-semibold text-zinc-800">
              {title ?? "編集"}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-900/5"
            >
              閉じる
            </button>
          </div>

          <div className="h-px bg-zinc-200" />
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 pt-3 pb-24">
          {children}
        </div>
      </div>
    </div>
  );
}
