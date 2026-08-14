# Review: プロジェクト名を waoon → wanonwan に全面改称（コードレビュー）

| 項目 | 値 |
|---|---|
| 対象 Plan | [`plans/2026-08-13-0107-rename-wanonwan.md`](../plans/2026-08-13-0107-rename-wanonwan.md) |
| 種別 | コードレビュー |
| 対象 | branch `refactor/rename-wanonwan-v2`（`531789f` / `5a04353`）/ 起点 `develop@ce284ae` |
| レビュアー | Claude Code |
| verdict | **APPROVE** |

## サマリ

202 ファイル・+867/-776 の全面改称をレビューした。大半は機械置換だが、
`check-secrets.mjs` の fail-closed 化と表示名の大文字化は手作業のため重点的に見た。
**ユーザー可視の表示文字列 6 箇所が小文字のまま残っていた**のを検出し修正済み。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE |
| Plan 判定 | N/A |
| 実装判定 | APPROVE |
| 記録整理 | OK |

> **初回判定（履歴）**: `BLOCKED`（下記 BLOCKER 1 件）。同一ブランチ内で修正し
> 再検証まで完了したため `APPROVE` に更新した。

## Findings

### [BLOCKER] ユーザー可視の表示文字列が小文字 `wanonwan` のまま残っていた — 修正済み

**重大度**: HIGH（実行時バグではないが、製品の可視ブランディング全面）

Plan の「表記の正規形」は **表示名（散文・見出し）= `Wanonwan`** と定めているが、
実装 Step 5 の目視補正が `.md` のみを対象にしており、**アプリの UI 文字列を取りこぼしていた**。
機械置換は `waoon` → `wanonwan`（小文字）を作るため、元が小文字ブランドだった UI は
すべて小文字のまま残る。

| ファイル:行 | 内容 | 可視性 |
|---|---|---|
| `apps/web/app/layout.tsx:13` | `title: { default: "wanonwan", template: "%s ｜ wanonwan" }` | **全ページのブラウザタブ** |
| `apps/web/components/layout/AppSidebar.tsx:48` | `brand={{ ..., label: "wanonwan" }}` | **全ページのサイドバー brand** |
| `apps/web/components/layout/AppLayout.tsx:71` | `?? "wanonwan"`（タブタイトルの fallback） | ブラウザタブ |
| `apps/web/hooks/useDocumentTitle.ts:19` | title suffix `${title} ｜ wanonwan` | ブラウザタブ（実行時） |
| `apps/web/app/login/page.tsx:140` | `© 2026 wanonwan` | ログイン画面 |
| `apps/web/app/login/page.tsx:158` | `copyrightText="© 2026 wanonwan"` | ログイン画面 |

`layout.tsx` の template と `useDocumentTitle` の suffix は**一致していないと
タブタイトルが揺れる**ため、片方だけの修正では不十分。両方を同時に `Wanonwan` へ揃えた。

**対応**: 6 箇所すべてを `Wanonwan` に修正。あわせて
`useDocumentTitle.ts:8,10` の「既定の `"wanonwan"`」というコメントも実値と食い違って
**誤誘導するため**更新した。`pnpm turbo run typecheck lint build test` を再実行し 12 タスク全 pass。

### [NICE-TO-HAVE] localStorage キーの改名でログイン画面の「メールを記憶」が失われる

`apps/web/app/login/page.tsx:12` の `REMEMBER_KEY` が
`waoon.rememberedEmail` → `wanonwan.rememberedEmail` に変わる。既存ブラウザの
保存値は読めなくなり、初回アクセスでメール欄が空になる。

Cookie 改名（全セッション無効化）と同種の影響だが、Plan のリスク表は Cookie しか
挙げていない。実害は軽微（再入力のみ）なので修正はせず、**Plan のリスク表に 1 行追加**して
後日の再調査を防ぐ。旧キーは expiry を持たないため、ブラウザに残り続ける点も Cookie と同様。

## 実装レビュー

**`check-secrets.mjs` の fail-closed 化**（唯一のロジック変更）は妥当。

```js
const domain = env.WANONWAN_DOMAIN ?? "";
if (!domain) { errors.push("WANONWAN_DOMAIN が未設定です（必須）"); }
else if (domain.endsWith(".example.com")) { ... }
```

- 既存の `requireSecret()` が返す「未設定です（必須）」の文言と揃っており、既存パターンに従う
- 分岐は 2 段で、ネストも複雑度も増えていない
- 元の挙動（`.example.com` 検知）は `else if` に保存され、退行なし
- 実測で旧キー env → exit 1、新キー env → exit 0 を確認

**機械置換の妥当性**: `waoon` は他語の部分文字列にならない固有語のため巻き込み事故なし。
識別子（`@wanonwan/*` / `wanonwan-postgres` / `STORAGE_BUCKET` / `REMEMBER_KEY` /
`gc.test.ts` の bucket 名）は小文字が正しく、表示名のみ大文字という使い分けが
修正後は全域で一貫している。

**テスト**: 新規ロジックは `check-secrets.mjs` の 1 分岐のみ。同スクリプトは unit test を
持たない既存の作りで、本 PR で構造を変えていないため、テスト追加は求めない（実測で
両ケースを確認済み）。

## 運用 / インフラ影響

| 項目 | 影響 | 対応状況 |
|---|---|---|
| dev の DB / MinIO ボリューム | compose project 名の変更で旧 `waoon_*` volume が孤児化 | rename コミット**前**に `down -v` 実施済み。旧イメージも削除済み |
| DB 名 | `cron.database_name` がイメージにベイクされているため再ビルド必須 | 実施済み。`show cron.database_name` = `wanonwan`、pg_cron 拡張の存在を確認 |
| stg の既存スタック | 旧 project 名のため新 compose file では停止できない | Plan Step 8 に `-p waoon-stg` を明示した破棄手順あり |
| stg/prod の `.env` | `.gitignore` 対象でサーバ上にしかなく、キー改名が届かない | fail-closed 化により旧キーのままなら `compose:stg:up` が失敗する |
| GHCR | `waoon-{web,worker}` → `wanonwan-{web,worker}` の新パッケージが作られる | Plan Step 8 に旧パッケージ削除を記載 |
| `outputs/` の過去 PR リンク | `/waoon/pull/N` → `/wanonwan/pull/N` に置換済みで、リポジトリ rename までは 404 | Plan の判断ログで受容済み（rename 後に自動リダイレクト） |
| CI | イメージ名変更に `Build DB image` → `Snapshot drift check` の順序が追随 | ローカルで drift なしを先行確認 |

## 検証

- [x] `pnpm turbo run typecheck lint build test` — 12 タスク全 pass（修正後に再実行）
- [x] `pnpm test:db` — pgTAP 9 ファイル全 pass
- [x] snapshot drift なし
- [x] `cron.database_name` = `wanonwan` / pg_cron 拡張あり
- [x] MinIO に `wanonwan` バケットが冪等作成される
- [x] 実ログインで `wanonwan-access` / `wanonwan-refresh` を発行
- [x] `check-secrets` が旧キーで exit 1・新キーで exit 0
- [ ] **未検証**: stg / prod での実起動（サーバ作業。Plan Step 8）
- [ ] **未検証**: CD による GHCR への新イメージ push（PR merge 後）

## フォローアップ

- [ ] Plan のリスク表に localStorage キー改名の影響を追記
- [ ] 退避ブランチ `refactor/rename-wanonwan`（`5d0613e`、旧 develop 起点）を削除
- [ ] 本 PR の範囲外（Plan の残課題に記載済み）:
      snapshot 経路で pg_cron ジョブが登録されない / `outputs/verification/` の残存
