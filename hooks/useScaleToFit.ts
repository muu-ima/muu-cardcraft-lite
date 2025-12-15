"use client";
import { useEffect, useRef, useState } from "react";

export function useScaleToFit(baseW: number, enabled: boolean = true) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;

      // ✅ ここが重要：一瞬 0 になるタイミング（モーダル/レイアウト変更）を無視
      if (w <= 0) return;

      const next = Math.min(w / baseW, 1);

      // ✅ 連続で同じ値なら更新しない（再レンダ減る＆安定）
      setScale((prev) => (Math.abs(prev - next) < 0.0001 ? prev : next));
    };

    // 初回
    update();

    // ✅ 初回直後のレイアウト確定後にももう一回（Portal/フォント/描画遅延対策）
    const raf = requestAnimationFrame(update);

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [baseW, enabled]);

  return { ref, scale };
}
