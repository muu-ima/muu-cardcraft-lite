"use client";

import React from "react";

type Props = {
  scale: number;
  cardW: number;
  cardH: number;
  showCenter?: boolean;
};

export default function PrintGuides({
  scale,
  cardW,
  cardH,
  showCenter = true,
}: Props) {
  const bleed = 12;
  const safe = 18;

  const cx = (cardW / 2) * scale;
  const cy = (cardH / 2) * scale;

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute right-2 top-2 rounded-md bg-white/80 px-2 py-1 text-xs text-zinc-800">
        {Math.round(scale * 100)}%
      </div>

      {/* 外枠 */}
      <div className="absolute inset-0 border border-zinc-700/30" />

      {/* 塗り足し */}
      <div
        className="absolute border border-red-500/60"
        style={{
          left: bleed * scale,
          top: bleed * scale,
          right: bleed * scale,
          bottom: bleed * scale,
        }}
      />

      {/* 安全枠 */}
      <div
        className="absolute border border-blue-500/60"
        style={{
          left: safe * scale,
          top: safe * scale,
          right: safe * scale,
          bottom: safe * scale,
        }}
      />

      {/* 正中線 */}
      {showCenter && (
        <>
        <div
        className="absolute top-0 h-full w-px bg-zinc-900/20"
        style={{ left: cx}} />
         <div
            className="absolute left-0 w-full h-px bg-zinc-900/20"
            style={{ top: cy }}
          />
        </>
      )}
    </div>
  );
}
