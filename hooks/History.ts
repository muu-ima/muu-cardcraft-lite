"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type Options = {
    max?: number;  // undoできる回数（pastの最大数）
}

/**
 * Undo/Redo 用の履歴管理フック
 *
 * - present: 現在の状態（真実）
 * - set(next): 履歴に積まずに現在を更新（ドラッグ中など）
 * - commit(next): 履歴に積んでから更新（操作確定時）
 * - undo()/redo()
 *
 * NOTE:
 * - 履歴に積むのは「軽いJSON（blocks等）」推奨
 * - 画像/Canvasそのものは積まない
 */

export function useHistoryState<T>(initial: T, opts: Options = {}) {
    const max = opts.max ?? 5;
    
    const [present, setPresent] = useState<T>(() => clone(initial));
    const pastRef = useRef<T[]>([]);
    const futureRef = useRef<T[]>([]);

    // 再レンダリング用(refだけだとUIが更新されないため)
    const[, bump] = useState(0);
    const rerender = () => bump((n) => (n + 1) % 1_000_000);

    const canUndo = pastRef.current.length > 0;
    const canRedo = futureRef.current.length > 0;

    const clear = useCallback((next?: T) => {
        pastRef.current = [];
        futureRef.current = [];
        if (next !== undefined) setPresent(clone(next));
        rerender();
    }, []);

    // 履歴に積まない(ドラッグ中の追従など)
    const set = useCallback((next: T | ((prev: T) => T)) => {
        setPresent((prev) => {
            const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
            return resolved;
        });
        // past/future は触らない
    }, []);

    // 履歴に積む (確定)
    const commit = useCallback((next: T | ((prev: T) => T)) => {
        setPresent((prev) => {
            const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;

              // 現在をpastへ
              pastRef.current = [...pastRef.current, clone(prev)].slice(-max);

             // 新しい操作が入ったら future は破棄
             futureRef.current = [];

             rerender();
             return resolved;
        });
    }, [max]);

    const undo = useCallback(() => {
        const past = pastRef.current;
        if(past.length === 0) return;

        const prev = past[past.length - 1];
        pastRef.current = past.slice(0, -1);

        // 現在をfutureへ
        futureRef.current = [clone(present), ...futureRef.current];

        setPresent(clone(prev));
        rerender();
    }, [present]);

    const redo = useCallback(() => {
        const future = futureRef.current;
        if(future.length === 0) return;

        const next = future[0];
        futureRef.current = future.slice(1);

        // 現在をpastへ
        pastRef.current = [...pastRef.current, clone(present)].slice(-max);

        setPresent(clone(next));
        rerender();
    }, [present, max]);

    const api = useMemo(
        () => ({
             present,
      set,
      commit,
      undo,
      redo,
      clear,
      canUndo,
      canRedo,
      // デバッグやUI表示に使いたい時用
      _debug: {
        get pastSize() {
            return pastRef.current.length;
        },
        get futureSize() {
            return futureRef.current.length;
        },
      },    
    }),
    [present, set, commit, undo, redo, clear, canUndo, canRedo]
    );
    return api;
}
/** structuredClone が無い環境もあるので保険 */
function clone<T>(v: T): T {
    if (typeof structuredClone === "function") return structuredClone(v);
    return JSON.parse(JSON.stringify(v)) as T;
}
