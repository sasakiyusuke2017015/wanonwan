import "server-only";
import { createGoTrueClient } from "@wanonwan/auth";
import { GOTRUE_URL } from "./env";

// アプリ全体で共有する GoTrue クライアント（サーバ専用）。
export const gotrue = createGoTrueClient({ url: GOTRUE_URL });
