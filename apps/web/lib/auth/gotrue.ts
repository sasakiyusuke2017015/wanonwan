import "server-only";
import { createGoTrueClient, type GoTrueClient } from "@wanonwan/auth";
import { getGotrueUrl } from "./env";

// アプリ全体で共有する GoTrue クライアント（サーバ専用）。
// 生成は初回アクセス時（module 評価時に env を要求すると `next build` が落ちる）。
let client: GoTrueClient | null = null;

export function gotrue(): GoTrueClient {
  return (client ??= createGoTrueClient({ url: getGotrueUrl() }));
}
