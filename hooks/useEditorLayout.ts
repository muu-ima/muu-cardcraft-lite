"use client";

import type { TabKey } from "@/shared/editor";

const PREVIEW_W = 480;
const PREVIEW_H = 260;

type Args = {
  activeTab: TabKey | null;
  isPreview: boolean;
};

export function useEditorLayout({ activeTab }: Args) {
  // 左パネルが出ているか
  const panelVisible = activeTab !== null;

  // ボトムシートのタイトル
  const sheetTitle =
    activeTab === "design"
      ? "デザイン"
      : activeTab === "text"
      ? "テキスト"
      : activeTab === "export"
      ? "書き出し"
      : "編集";

  // プレビュー表示サイズ（scaleは外で掛ける）
  const previewSize = {
    w: PREVIEW_W,
    h: PREVIEW_H,
  };

  return {
    panelVisible,
    sheetTitle,
    previewSize,
  };
}
