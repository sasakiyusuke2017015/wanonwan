"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface SubHeaderSlotContextValue {
  /** portal の差し込み先 (AppLayout の SubHeader 内 div) */
  container: HTMLDivElement | null;
  /** ページがスロットを使用中か (true の間 AppLayout は既定の画面名表示を隠す) */
  setClaimed: (claimed: boolean) => void;
}

const SubHeaderSlotContext = createContext<SubHeaderSlotContextValue | null>(null);

export const SubHeaderSlotProvider = SubHeaderSlotContext.Provider;

/**
 * SubHeader 領域へページ独自のコンテンツ (SubHeaderToolbar 等) を差し込む portal。
 *
 * AppLayout の SubHeader 内コンテナへ createPortal で描画するので、検索値などの
 * state はページ側ツリーに置いたまま chrome に表示できる。マウント中は AppLayout の
 * 既定表示 (画面名) が非表示になる。
 */
export function SubHeaderPortal({ children }: { children: ReactNode }) {
  const ctx = useContext(SubHeaderSlotContext);
  const setClaimed = ctx?.setClaimed;

  useEffect(() => {
    if (!setClaimed) return;
    setClaimed(true);
    return () => setClaimed(false);
  }, [setClaimed]);

  if (ctx === null) {
    throw new Error("SubHeaderPortal は AppLayout (SubHeaderSlotProvider) の中で使ってください");
  }
  if (!ctx.container) return null;
  return createPortal(children, ctx.container);
}
