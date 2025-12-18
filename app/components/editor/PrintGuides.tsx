"use client";

import React from "react";

export default function PrintGuides({ scale }: { scale: number }) {
  const bleed = 12;
  const safe = 18;

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute right-2 top-2 rounded-md bg-white/80 px-2 py-1 text-xs text-zinc-800">
        {Math.round(scale * 100)}%
      </div>

      <div className="absolute inset-0 border border-zinc-700/30" />

      <div
        className="absolute border border-red-500/60"
        style={{
          left: bleed * scale,
          top: bleed * scale,
          right: bleed * scale,
          bottom: bleed * scale,
        }}
      />

      <div
        className="absolute border border-blue-500/60"
        style={{
          left: safe * scale,
          top: safe * scale,
          right: safe * scale,
          bottom: safe * scale,
        }}
      />
    </div>
  );
}
