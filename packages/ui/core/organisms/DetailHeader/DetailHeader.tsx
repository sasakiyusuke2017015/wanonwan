'use client'

import React from "react";
import { Button } from "../../molecules/Button";

export interface DetailHeaderField {
  label: string;
  value: React.ReactNode;
  /** クリック時のハンドラ（値をリンク風にする） */
  onClick?: () => void;
  /** モノスペースフォントで表示 */
  mono?: boolean;
}

export interface DetailHeaderAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "default" | "outline" | "danger";
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DetailHeaderProps {
  /** タイトル左のアイコン */
  icon?: React.ReactNode;
  /** タイトル */
  title: string;
  /** タイトル右のバッジ等 */
  badge?: React.ReactNode;
  /** 情報フィールド */
  fields: DetailHeaderField[];
  /** アクションボタン */
  actions?: DetailHeaderAction[];
  /** レイアウトバリアント */
  variant?: "compact" | "split" | "minimal";
}

/** variant マッピング */
const variantMap = {
  primary: "primary",
  danger: "danger",
  outline: "outline",
  default: "default",
} as const;

/** コンパクト: 1カード、縦積みラベル・値 + ボタン行 */
function CompactLayout({ icon, title, badge, fields, actions }: DetailHeaderProps) {
  return (
    <div className="bg-(--color-card-bg) shadow rounded-lg p-4" data-component="detail-header" data-variant="compact">
      {/* タイトル行 */}
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-[18px] shrink-0">{icon}</span>}
        <h2 className="text-[16px] font-bold text-(--color-text) truncate">{title}</h2>
        {badge}
      </div>

      {/* フィールド */}
      <div className="flex flex-col gap-1.5 mb-3">
        {fields.map((f, i) => (
          <div key={i} className="flex items-baseline gap-2 text-[12px]">
            <span className="w-20 text-(--color-text-muted) shrink-0">{f.label}</span>
            {f.onClick ? (
              <Button
                variant="ghost"
                size="small"
                onClick={f.onClick}
                enableHopEffect={false}
                className={`!p-0 text-(--color-accent) hover:underline truncate text-left ${f.mono ? "font-mono" : ""}`}
              >
                {f.value}
              </Button>
            ) : (
              <span className={`text-(--color-text) truncate ${f.mono ? "font-mono" : ""}`}>
                {f.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* アクション */}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-(--color-border)">
          {actions.map((a, i) => (
            <Button
              key={i}
              variant={variantMap[a.variant ?? "default"]}
              size="small"
              disabled={a.disabled}
              onClick={a.onClick}
              enableHopEffect={false}
            >
              <span className="flex items-center gap-1.5">
                {a.icon}
                {a.label}
              </span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

/** スプリット: 左に情報、右にアクション */
function SplitLayout({ icon, title, badge, fields, actions }: DetailHeaderProps) {
  return (
    <div className="bg-(--color-card-bg) shadow rounded-lg p-4" data-component="detail-header" data-variant="split">
      <div className="flex gap-4">
        {/* 左: タイトル + フィールド */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-[18px] shrink-0">{icon}</span>}
            <h2 className="text-[16px] font-bold text-(--color-text) truncate">{title}</h2>
            {badge}
          </div>
          <div className="flex flex-col gap-1">
            {fields.map((f, i) => (
              <div key={i} className="flex items-baseline gap-2 text-[12px]">
                <span className="w-20 text-(--color-text-muted) shrink-0">{f.label}</span>
                {f.onClick ? (
                  <button
                    type="button"
                    className={`text-(--color-accent) hover:underline cursor-pointer truncate text-left ${f.mono ? "font-mono" : ""}`}
                    onClick={f.onClick}
                  >
                    {f.value}
                  </button>
                ) : (
                  <span className={`text-(--color-text) truncate ${f.mono ? "font-mono" : ""}`}>
                    {f.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右: アクション（縦積み） */}
        {actions && actions.length > 0 && (
          <div className="flex flex-col gap-1.5 shrink-0">
            {actions.map((a, i) => (
              <Button
                key={i}
                variant={variantMap[a.variant ?? "default"]}
                size="small"
                disabled={a.disabled}
                onClick={a.onClick}
                enableHopEffect={false}
              >
                <span className="flex items-center gap-1.5">
                  {a.icon}
                  {a.label}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** ミニマル: ボーダーレス、超軽量 */
function MinimalLayout({ icon, title, badge, fields, actions }: DetailHeaderProps) {
  return (
    <div className="px-2 py-3" data-component="detail-header" data-variant="minimal">
      {/* タイトル + バッジ + プライマリアクション */}
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-[16px] shrink-0">{icon}</span>}
        <h2 className="text-[15px] font-bold text-(--color-text) truncate">{title}</h2>
        {badge}
        {actions && actions.length > 0 && (
          <div className="flex gap-1.5 ml-auto shrink-0">
            {actions.map((a, i) => (
              <Button
                key={i}
                variant={variantMap[a.variant ?? "default"]}
                size="small"
                disabled={a.disabled}
                onClick={a.onClick}
                enableHopEffect={false}
              >
                <span className="flex items-center gap-1">
                  {a.icon}
                  {a.label}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* フィールド */}
      <div className="flex flex-col gap-0.5 text-[11px]">
        {fields.map((f, i) => (
          <span key={i} className="flex items-baseline gap-1">
            <span className="text-(--color-text-muted)">{f.label}:</span>
            {f.onClick ? (
              <Button
                variant="ghost"
                size="small"
                onClick={f.onClick}
                enableHopEffect={false}
                className={`!p-0 text-(--color-accent) hover:underline ${f.mono ? "font-mono" : ""}`}
              >
                {f.value}
              </Button>
            ) : (
              <span className={`text-(--color-text) ${f.mono ? "font-mono" : ""}`}>
                {f.value}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DetailHeader(props: DetailHeaderProps) {
  const { variant = "compact" } = props;
  switch (variant) {
    case "split":
      return <SplitLayout {...props} />;
    case "minimal":
      return <MinimalLayout {...props} />;
    default:
      return <CompactLayout {...props} />;
  }
}
