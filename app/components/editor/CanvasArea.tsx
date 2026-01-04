// app/components/editor/CanvasArea.tsx
import React from "react";

export default function CanvasArea({
  children,
  innerRef,
  panelVisible,
  onBackgroundPointerDown,
}: {
  children: React.ReactNode;
  innerRef: React.RefObject<HTMLDivElement | null>;
  panelVisible: boolean;
  onBackgroundPointerDown?: (e: React.PointerEvent) => void;
}) {
  return (
    <main
      className={[
        "ml-0",
        panelVisible ? "xl:ml-[416px]" : "xl:ml-14",
        "h-[calc(100vh-56px)]",
        "min-w-0 overflow-y-auto overflow-x-hidden",
        "px-3 sm:px-6 lg:px-10 py-8",
        "pb-24 xl:pb-0",
        "flex justify-center",
        "transition-none",
      ].join(" ")}
        onPointerDown={(e) => {
    if (e.target === e.currentTarget) onBackgroundPointerDown?.(e);
  }}

    >
      <div
        className={[
          "w-full flex justify-center",
          panelVisible ? "xl:-translate-x-[180px]" : "translate-x-0",
        ].join(" ")}
      >
        <div ref={innerRef} className="w-full max-w-[480px] min-w-0">
          {children}
        </div>
      </div>
    </main>
  );
}
