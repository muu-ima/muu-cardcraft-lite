export const FONT_DEFINITIONS = {
  sans: {
    label: "ゴシック",
    css: "'Noto Sans JP', system-ui, sans-serif",
  },
  maru: {
    label: "丸ゴシック",
    css: "'Zen Maru Gothic', system-ui, sans-serif",
  },
  serif: {
    label: "明朝",
    css: "'Noto Serif JP', serif",
  },
} as const;

export type FontKey = keyof typeof FONT_DEFINITIONS;

// フォントサイズの増減量
// 1ステップ刻みならこれでOK
export type FontSizeDelta = 1 | -1;
