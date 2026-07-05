"use client";

import { useEffect } from "react";

// クライアントページのタブタイトルを設定する。"use client" ページは Next の
// `metadata` を export できないため、mount 後に document.title を直接設定する。
// suffix「 ｜ waoon」を付ける（ルート metadata の template と揃える）。
// title が空 / "waoon" のときは既定の "waoon" のまま。
//
// フルロード時は effect の直後に Next のストリーミング metadata（既定 "waoon"）が
// <title> を上書きするため、設定して終わりでは負ける。document.head を MutationObserver で
// 監視し（Next は <title> 要素ごと差し替えるため title 単体でなく head を見る）、
// 望む値以外に書き換えられたら即座に戻す（同値なら再設定しないのでループしない）。
// 前提: 同一ツリーで同時に 1 箇所からのみ呼ぶ（AppLayout 一括 + AppLayout 外の
// login/change-password 個別）。複数箇所から異なる title で呼ぶと observer 同士が
// 上書き合戦になるので、ページ個別化するときは AppLayout 側を止めること。
export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    const desired = title && title !== "waoon" ? `${title} ｜ waoon` : "waoon";
    const apply = () => {
      if (document.title !== desired) document.title = desired;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);
}
