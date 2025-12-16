"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Options = {
  /** 最小倍率（文字が読めなくなるのを防ぐ） */
  minScale?: number;
  /** 最大倍率（拡大しすぎ防止） */
  maxScale?: number;
  /** container の左右 padding を差し引く */
  paddingX?: number;
};

export function useScaleToFit(
  baseWidth: number,
  enabled: boolean = true,
  options: Options = {}
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [containerW, setContainerW] = useState<number>(0);

  const { minScale = 0.2, maxScale = 1, paddingX = 0 } = options;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setContainerW(w);
    });

    ro.observe(el);

    // 初回も即反映
    setContainerW(el.clientWidth);

    return () => ro.disconnect();
  }, [enabled]);

  const scale = useMemo(() => {
    if (!enabled) return 1;
    if (!containerW) return 1;

    const available = Math.max(0, containerW - paddingX);
    const raw = available / baseWidth;

    const clamped = Math.min(maxScale, Math.max(minScale, raw));
    // 小数が暴れて再レンダーし続けるのを抑える
    return Math.round(clamped * 1000) / 1000;
  }, [enabled, containerW, baseWidth, minScale, maxScale, paddingX]);

  return { ref, scale };
}
