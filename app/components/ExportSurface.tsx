// app/components/ExportSurface.tsx
"use client";

import { forwardRef } from "react";
import CardSurface from "@/app/components/CardSurface";
import type { Block, DesignKey } from "@/hooks/useCardBlocks";

type Props = {
  blocks: Block[];
  design: DesignKey;
};

const ExportSurface = forwardRef<HTMLDivElement, Props>(function ExportSurface(
  { blocks, design },
  ref
) {
  return (
    <div
      style={{
        position: "fixed",
        left: -10000,
        top: 0,
        width: 480,
        height: 260,
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      {/* 中身は常に実寸・scaleなし */}
      <div ref={ref}>
        <CardSurface blocks={blocks} design={design} interactive={false} />
      </div>
    </div>
  );
});

export default ExportSurface;
