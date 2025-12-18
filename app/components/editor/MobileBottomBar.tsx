//app/editor/components/MobileBottomBar.tsx
"use client";

import React from "react";
import type { TabKey } from "@/shared/editor";

function MobileBottomBarItem({
  tab,
  label,
  activeTab,
  onChangeTab,
}: {
  tab: TabKey;
  label: string;
  activeTab: TabKey | null;
  onChangeTab: (tab: TabKey) => void;
}) {
  const active = activeTab === tab;

  return (
    <button
      type="button"
      onClick={() => onChangeTab(tab)}
      className={[
        "flex flex-1 flex-col items-center justify-center gap-1 py-2",
        active ? "text-blue-700" : "text-zinc-600",
      ].join(" ")}
    >
      <span
        className={[
          "h-6 w-6 rounded-md",
          active ? "bg-blue-600/15" : "bg-zinc-900/5",
        ].join(" ")}
      />
      <span className="text-[11px]">{label}</span>
    </button>
  );
}

export default function MobileBottomBar({
  activeTab,
  onChangeTab,
}: {
  activeTab: TabKey | null;
  onChangeTab: (tab: TabKey) => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 xl:hidden">
      <div className="border-t bg-white/90 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-14 max-w-[520px]">
          <MobileBottomBarItem
            tab="design"
            label="デザイン"
            activeTab={activeTab}
            onChangeTab={onChangeTab}
          />
          <MobileBottomBarItem
            tab="text"
            label="テキスト"
            activeTab={activeTab}
            onChangeTab={onChangeTab}
          />
          <MobileBottomBarItem
            tab="export"
            label="書き出し"
            activeTab={activeTab}
            onChangeTab={onChangeTab}
          />
        </div>
      </div>
    </div>
  );
}
