"use client";

import { useEffect } from "react";

// クライアントページのタブタイトルを設定する。"use client" ページは Next の
// `metadata` を export できないため、mount 後に document.title を直接設定する。
// suffix「 ｜ waoon」を付ける（ルート metadata の template と揃える）。
// title が空 / "waoon" のときは既定の "waoon" のまま。
export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    document.title = title && title !== "waoon" ? `${title} ｜ waoon` : "waoon";
  }, [title]);
}
