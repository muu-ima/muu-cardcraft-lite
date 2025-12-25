"use client";

import React from "react";
import type { TabKey } from "@/shared/editor";

export type Align = "left" | "center" | "right";

export type CenterToolbarValue = {
  fontKey: "sans" | "maru" | "serif";
  fontSize: number;
  bold: boolean;
  align: Align;
};

type Props = {
  /** テキスト選択中だけ表示（nullなら非表示） */
  value: CenterToolbarValue | null;

  // ✅ 追加（Canvas状態）
  side: "front" | "back";
  onChangeSide: (side: "front" | "back") => void;

  showGuides: boolean;
  onToggleGuides: () => void;

  /** どのパネルが開いてるか（ハイライト用） */
  activeTab: TabKey | null;

  /** ツールバー操作で左パネルを開く */
  onOpenTab: (tab: TabKey) => void;

  /** クイック操作 */
  onChangeFontSize: (next: number) => void;
  onToggleBold: () => void;
  onChangeAlign: (align: Align) => void;

  /** プレビュー中など */
  disabled?: boolean;

  /** 固定位置の微調整など */
  className?: string;

  /** ヘッダー高さに合わせた top（デフォ 76px） */
  topPx?: number;
};

export default function CenterToolbar({
  value,
  activeTab,
  onOpenTab,
  onChangeFontSize,
  onToggleBold,
  onChangeAlign,

  // ✅ 追加（表/裏・ガイド）
  side,
  onChangeSide,
  showGuides,
  onToggleGuides,

  disabled = false,
  className,
  topPx = 76,
}: Props) {
  const isFontOpen = activeTab === "font";
  const isTextOpen = activeTab === "text";

  return (
    <div
      className={["sticky z-40 flex justify-center", className ?? ""].join(" ")}
      style={{ top: topPx }}
    >
      <div
        className={[
          "pointer-events-auto flex items-center gap-2 rounded-2xl border bg-white/85 px-3 py-2 backdrop-blur",
          "shadow-[0_1px_0_rgba(0,0,0,0.06),0_10px_22px_rgba(0,0,0,0.10)]",
          value === null ? "opacity-70" : "",
        ].join(" ")}
        aria-label="中央ツールバー"
      >
        {/* ✅ ① テキスト系：valueがある時だけ描画（ここ以外で value を触らない） */}
        {value && (
          <>
            {/* フォント */}
            <ToolbarButton
              pressed={isFontOpen}
              disabled={disabled}
              onClick={() => onOpenTab("font")}
              className="max-w-[220px]"
              title="フォントを開く"
            >
              <span className="max-w-[180px] truncate">{value.fontKey}</span>
              <span className="text-zinc-400">▼</span>
            </ToolbarButton>

            <Divider />

            {/* サイズ */}
            <IconButton
              label="文字サイズを下げる"
              disabled={disabled}
              onClick={() =>
                onChangeFontSize(clamp(value.fontSize - 1, 6, 200))
              }
            >
              −
            </IconButton>

            <ToolbarButton
              pressed={isTextOpen}
              disabled={disabled}
              onClick={() => onOpenTab("text")}
              className="min-w-14 justify-center border"
              title="テキスト設定を開く"
            >
              <span className="tabular-nums">{value.fontSize}</span>
            </ToolbarButton>

            <IconButton
              label="文字サイズを上げる"
              disabled={disabled}
              onClick={() =>
                onChangeFontSize(clamp(value.fontSize + 1, 6, 200))
              }
            >
              +
            </IconButton>

            <Divider />

            {/* 太字 */}
            <ToggleButton
              label="太字"
              active={value.bold}
              disabled={disabled}
              onClick={onToggleBold}
            >
              B
            </ToggleButton>

            {/* 整列 */}
            <div className="ml-1 flex items-center gap-1">
              <ToggleButton
                label="左揃え"
                active={value.align === "left"}
                disabled={disabled}
                onClick={() => onChangeAlign("left")}
              >
                L
              </ToggleButton>
              <ToggleButton
                label="中央揃え"
                active={value.align === "center"}
                disabled={disabled}
                onClick={() => onChangeAlign("center")}
              >
                C
              </ToggleButton>
              <ToggleButton
                label="右揃え"
                active={value.align === "right"}
                disabled={disabled}
                onClick={() => onChangeAlign("right")}
              >
                R
              </ToggleButton>
            </div>
          </>
        )}

        {/* ✅ ② 右側：表/裏・ガイドは「常に出す」 */}
        {/* value が無い時に区切り線だけ残したくないなら条件にする */}
        <Divider />

        <Segmented
          disabled={disabled}
          value={side}
          options={[
            { value: "front", label: "表面" },
            { value: "back", label: "裏面" },
          ]}
          onChange={onChangeSide}
        />

        <TogglePill
          disabled={disabled}
          active={showGuides}
          onClick={onToggleGuides}
        >
          ガイド {showGuides ? "ON" : "OFF"}
        </TogglePill>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Divider() {
  return <div className="mx-1 h-6 w-px bg-zinc-200" />;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function ToolbarButton({
  children,
  onClick,
  pressed,
  disabled,
  className,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      title={title}
      aria-pressed={!!pressed}
      className={[
        "flex h-9 items-center gap-2 rounded-xl px-3 text-sm",
        "hover:bg-zinc-100 active:bg-zinc-200",
        pressed ? "bg-pink-50 ring-1 ring-pink-200" : "",
        disabled ? "cursor-not-allowed" : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function IconButton({
  children,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={[
        "h-9 w-9 rounded-xl border bg-white text-sm",
        "hover:bg-zinc-50 active:bg-zinc-100",
        disabled ? "cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ToggleButton({
  children,
  onClick,
  label,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={[
        "h-9 w-9 rounded-xl border text-sm",
        active
          ? "bg-pink-50 ring-1 ring-pink-200"
          : "bg-white hover:bg-zinc-50 active:bg-zinc-100",
        disabled ? "cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border bg-white">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => !disabled && onChange(opt.value)}
            className={[
              "h-9 px-3 text-sm",
              active
                ? "bg-pink-50 ring-1 ring-inset ring-pink-200"
                : "hover:bg-zinc-50",
              disabled ? "cursor-not-allowed opacity-70" : "",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function TogglePill({
  children,
  active,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={() => !disabled && onClick()}
      className={[
        "h-9 rounded-xl border px-3 text-sm",
        active
          ? "bg-pink-50 ring-1 ring-pink-200"
          : "bg-white hover:bg-zinc-50 active:bg-zinc-100",
        disabled ? "cursor-not-allowed opacity-70" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
