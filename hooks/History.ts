"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";

type Options = { max?: number };

export function useHistoryState<T>(initial: T, opts: Options = {}) {
  const max = opts.max ?? 5;

  const [present, setPresent] = useState<T>(() => clone(initial));
  const presentRef = useRef(present);
  useEffect(() => {
    presentRef.current = present;
  }, [present]);

  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);

  const [, bump] = useState(0);
  const rerender = () => bump((n) => (n + 1) % 1_000_000);

  const clear = useCallback((next?: T) => {
    pastRef.current = [];
    futureRef.current = [];
    if (next !== undefined) setPresent(clone(next));
    rerender();
  }, []);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setPresent((prev) => {
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      return resolved;
    });
  }, []);

  const commit = useCallback(
    (next: T | ((prev: T) => T)) => {
      setPresent((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;

        pastRef.current = [...pastRef.current, clone(prev)].slice(-max);
        futureRef.current = [];
        rerender();
        return resolved;
      });
    },
    [max]
  );

  // ✅ present 依存を 削除して ref で読む
  const undo = useCallback(() => {
    const past = pastRef.current;
    if (past.length === 0) return;

    const prev = past[past.length - 1];
    pastRef.current = past.slice(0, -1);

    futureRef.current = [clone(presentRef.current), ...futureRef.current];

    setPresent(clone(prev));
    rerender();
  }, []);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (future.length === 0) return;

    const next = future[0];
    futureRef.current = future.slice(1);

    pastRef.current = [...pastRef.current, clone(presentRef.current)].slice(-max);

    setPresent(clone(next));
    rerender();
  }, [max]);

  // ✅ useMemo は残してもOK（でも依存を減らす）
  const api = useMemo(
    () => ({
      present,
      set,
      commit,
      undo,
      redo,
      clear,
      canUndo: pastRef.current.length > 0,
      canRedo: futureRef.current.length > 0,
      _debug: {
        get pastSize() {
          return pastRef.current.length;
        },
        get futureSize() {
          return futureRef.current.length;
        },
      },
    }),
    [present, set, commit, undo, redo, clear]
  );

  return api;
}

function clone<T>(v: T): T {
  if (typeof structuredClone === "function") return structuredClone(v);
  return JSON.parse(JSON.stringify(v)) as T;
}
