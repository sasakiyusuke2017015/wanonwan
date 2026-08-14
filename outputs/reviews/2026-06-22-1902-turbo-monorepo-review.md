# Review: Turborepo 導入 + scripts ergonomics

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-22 19:02 JST |
| レビュアー | Claude Code（+ code-reviewer agent） |
| 対象 Plan | [`plans/2026-06-22-1447-turbo-monorepo.md`](../plans/2026-06-22-1447-turbo-monorepo.md) |
| ブランチ | `feature/turbo-monorepo` |
| 関連 PR | TBD |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER なし。turbo 全タスク green、CD 経路無変更 |
| Plan 判定 | N/A | 計画妥当性は [計画レビュー](2026-06-22-1558-turbo-monorepo-review.md) 済み |
| 実装判定 | **APPROVE** | turbo.json / scripts / CI / docs いずれも妥当。挙動確認済み |
| 記録整理 | OK | Plan・docs と実装が整合 |

## 検証

- [x] `pnpm turbo run typecheck lint build test` green（10 タスク）→ 2 回目 FULL TURBO（79ms）
- [x] root alias（`pnpm typecheck` / `lint` / `build` / `test`）通過
- [x] lint 拡大（web + ui）/ test 拡大（web + worker）通過
- [x] frozen lockfile 解決（turbo / rimraf 記録済み）
- [x] `clean:build` → `build` 再ビルド成功
- [x] `globalDependencies`（tsconfig.base.json / .npmrc）でキャッシュ無効化が発火することを実機確認
- [ ] CI green（PR 後）
- [ ] CD image build（笹木さん。`.dockerignore` に `**/.turbo` 既存・Dockerfile は turbo 非依存）

## 指摘事項

| 重大度 | ファイル | 指摘 | 対応 |
|---|---|---|---|
| LOW [NICE-TO-HAVE] | `turbo.json` | 共有設定のキャッシュ無効化漏れ防止に `globalDependencies` を入れるとよい | **本 PR で対応済**（`tsconfig.base.json` / `.npmrc` を追加。worker/auth/domain が root tsconfig を extends するため） |
| LOW [NICE-TO-HAVE] | `turbo.json` | `build`/`test` の `dependsOn: ["^build"]` は build を持つ package が web のみのため現状 no-op | 予防的宣言として意図的（判断ログ記載済み）。実機で無害確認 |

## 実装レビュー

- **turbo.json**: `typecheck=^typecheck`（全 package が持つため依存順が実発火）、`build`/`test=^build`（予防的 no-op）、`build.outputs` の `!.next/cache/**` で cache 除外。`globalDependencies` 追加でルート tsconfig 変更時のキャッシュ正確性を確保。
- **package.json**: build/lint/typecheck を turbo 化、`test` 新設。`dev`/`start`/`compose:*`/`db:*`/`test:db`/`provision:*` は turbo 外維持（長時間プロセス・副作用ありで適切）。
- **clean 系**: `rimraf -g` + クオートグロブで PowerShell 5.1 でも shell 非依存（docs-style 準拠）。`clean` の削除範囲も妥当。
- **CI**: 5 ステップを `turbo run typecheck lint build test` 1 本に集約。turbo fail 時、後続 DB ステップは `if` 条件なしのため GitHub Actions 既定で skip（`Stop DB stack` のみ `if: always()`）。`--frozen-lockfile` と整合。
- **docs**: CLAUDE.md スタック表・CONTRIBUTING テスト表を turbo 化に合わせて更新。lint/test の対象拡大を明記。

## 運用 / インフラ影響

- **CD 無変更で安全**: `infra/Dockerfile.web` は `pnpm --filter @wanonwan/web build` のまま（image に turbo を入れない）。`.dockerignore` に `**/.turbo` 既存で混入なし。
- env / migration / compose / volume への影響なし。devDependency 追加（turbo / rimraf）と lockfile 更新のみ。
- envMode strict（turbo 既定）で環境変数が明示宣言に限定される点はセキュリティ上好ましい。

## フォローアップ

- [ ] 任意: `.turbo` の `actions/cache` による CI キャッシュ（効果を見て判断）
- [ ] 任意: turbo Remote Cache（本 Plan スコープ外）
