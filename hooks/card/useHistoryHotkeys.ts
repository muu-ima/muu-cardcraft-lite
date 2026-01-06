// hooks/card/useHistoryHotkeys.ts
"use client";

import { useEffect } from "react";

type Args = {
  undo: () => void;
  redo: () => void;
  disabled?: boolean; // プレビュー中などで無効化したい時用
};

export function useHistoryHotkeys({ undo, redo, disabled }: Args) {
  useEffect(() => {
    if (disabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      // 入力中はブラウザ標準Undoに任せる（重要）
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      if (!ctrlOrCmd) return;

      // Cmd/Ctrl + Z
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Cmd/Ctrl + Shift + Z または Cmd/Ctrl + Y
      if (
        (e.key.toLowerCase() === "z" && e.shiftKey) ||
        e.key.toLowerCase() === "y"
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, disabled]);
}
