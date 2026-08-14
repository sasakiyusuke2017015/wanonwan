# Review: @wanonwan/storage 切り出し（storage-package）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-24 15:31 JST |
| レビュアー | Claude Code（code-reviewer + security-reviewer 並列） |
| 対象 Plan | [`plans/2026-07-24-0110-...-restructure.md`](../plans/2026-07-24-0110-storage-package-db-seed-restructure.md) |
| ブランチ | `refactor/storage-package` |
| 関連 PR | TBD |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE | BLOCKER 候補は実測で誤検知と判明。consistency 対応済み |
| Plan 判定 | N/A | |
| 実装判定 | APPROVE | env fail-fast / 署名・内部 endpoint 分離 / server-only 境界いずれも妥当 |
| 記録整理 | OK | |

## 指摘事項

| 重大度 | ファイル:行 | 指摘 | 対応 |
|---|---|---|---|
| ~~BLOCKER 候補~~ **誤検知→consistency 対応** | `apps/web/next.config.ts:6` | code-reviewer が「`transpilePackages` に `@wanonwan/storage` が無く build を壊す」と指摘 | **実測で決着**: build は有無どちらでも通る（Turbopack が workspace TS を解決）。当初の build 失敗はレビュー中のブランチ切替による stale `node_modules` が原因で、この指摘とは無関係だった。ただし同種の `@wanonwan/domain`/`@wanonwan/auth` が登録済みで、非 Turbopack(webpack) fallback 時の安全と一貫性のため **`@wanonwan/storage` を追加**した |
| LOW [NICE] | `packages/storage/src/presign.ts:15-31` | `ensureBucket` の Map キーが bucket 名のみ。将来「同一 bucket 名を別 client で ensure」すると先勝ちキャッシュで別 client 結果を再利用 | 現状 internal client 単一経路で実害なし。キーを `endpoint+bucket` にすると堅い |
| LOW [NICE] | `packages/storage/src/client.ts` | 署名用/内部用の両 client が同一 MinIO root 認証を使う。将来 scoped 資格情報に分離すると最小権限強化 | 既存踏襲・許容 |
| LOW [NICE] | `packages/storage/src/presign.ts:presignPut` | presign 時点でサイズ未制約。上限超過オブジェクトが complete 拒否まで MinIO に滞留（孤児）。軽微な DoS 余地 | presigned PUT では content-length-range を表現できず設計上の割り切り。孤児回収戦略があると堅い |
| LOW [NICE] | `infra/Dockerfile.worker:16,18` | `COPY packages/ packages/` で worker が使わない packages ソースも image に載る（依存 install はされず self-contained 性は維持） | image サイズの無駄のみ。secret 露出なし |
| LOW [NICE] | `packages/storage/src/client.ts:28` / `lib/storage/index.ts:32` | `STORAGE_INTERNAL_ENDPOINT` 未設定時に公開 endpoint へ静かにフォールバック。stg/prod で注入漏れると内部通信が nginx 往復に退化するがエラーにならない | 現状 compose 両方に注入済みで塞がれている。起動時 info ログで気付けると堅い |
| LOW [NICE] | `packages/storage/src/env.ts:31-32` | env エラーが不足キー名のみ（値は出さず正しい）。欠落/URL 不正の区別は無し | 必須ではない |

## 実装レビュー（良好点）

- **env 検証（env.ts）**: `^https?://` 追加で `v.url()` が `localhost:9000` を通す穴を塞ぐ。ACCESS/SECRET は必須・fail-fast、`?? "minioadmin"` 既定値を廃止（セキュリティ改善）。エラーは不足キー名のみで secret 非漏洩。
- **client 作り分け**: 署名=公開 endpoint、Head/Delete/bucket作成=internal。route 側で正しく使い分け（`route.ts:56-58` / `[id]/route.ts:59,122`）。公開経由の内部通信なし。
- **presigned URL の安全性**: object_key はサーバ採番（`randomUUID`）でクライアント制御不能。MIME allowlist は presign 前 + HeadObject 実測の両方、サイズ上限は complete 実測で担保。RLS スコープの添付のみ署名対象。
- **server-only 境界**: `lib/storage/index.ts:1` の `import "server-only"` で credentials のクライアント漏洩を防止。package は framework 非依存を維持。
- **Dockerfile.worker**: `.dockerignore` が `.env*`/`.git`/`.claude` を除外。非 root 実行維持。type-stripping 回避のため symlink 保持方式（realpath が packages/ 解決）。

## 検証

- [x] `pnpm -r typecheck` green（clean `node_modules`）
- [x] `pnpm --filter @wanonwan/storage test` green（17）
- [x] `pnpm --filter @wanonwan/web build` green（`.next` クリア後・transpilePackages 有無どちらでも）
- [x] 実 MinIO で presign PUT/GET・HeadObject・delete 往復（実装時確認済み）
- [ ] stg で `STORAGE_INTERNAL_ENDPOINT` 経由の内部通信（マージ後検証）

## フォローアップ

- [ ] `ensureBucket` のキャッシュキーに endpoint を含める（別 PR 可）
- [ ] 孤児オブジェクト（presign 後 complete されず滞留）の回収戦略
- [ ] worker image の packages コピー絞り込み
- [ ] `STORAGE_INTERNAL_ENDPOINT` 未設定フォールバックの起動時 info ログ
