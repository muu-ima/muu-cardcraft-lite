// shared/print.ts

/* =========================
 * 印刷実寸（mm）- 真実
 * ========================= */
export const MM_W = 85.6;
export const MM_H = 53.98;

// 一般的な名刺設定
export const BLEED_MM = 3; // 塗り足し
export const SAFE_MM = 3;  // 安全領域


/* =========================
 * エディタ基準サイズ（px）
 * ========================= */
// 横幅を基準にする（見やすさ・操作性優先）
export const CARD_BASE_W = 480;

// 比率は mm から必ず算出（← 超重要）
export const CARD_BASE_H = Math.round(
  CARD_BASE_W * (MM_H / MM_W)
);
// → 303


/* =========================
 * mm → px 変換
 * ========================= */
export const pxPerMm = CARD_BASE_W / MM_W;

export const bleedPx = BLEED_MM * pxPerMm;
export const safePx = SAFE_MM * pxPerMm;


/* =========================
 * ガイド用サイズ
 * ========================= */

// 仕上がり（裁断後）
export const FINISH_W = CARD_BASE_W;
export const FINISH_H = CARD_BASE_H;

// 塗り足し込みキャンバス
export const BLEED_W = CARD_BASE_W + bleedPx * 2;
export const BLEED_H = CARD_BASE_H + bleedPx * 2;

// 安全領域
export const SAFE_INSET = safePx;


/* =========================
 * 型的な意味づけ（任意）
 * ========================= */
export type PrintSize = {
  w: number;
  h: number;
};

export const FINISH_SIZE: PrintSize = {
  w: FINISH_W,
  h: FINISH_H,
};

export const BLEED_SIZE: PrintSize = {
  w: BLEED_W,
  h: BLEED_H,
};
