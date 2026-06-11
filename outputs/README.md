# outputs — Plan / Review ダッシュボード

Plan は [`plans/`](plans/)、Review は [`reviews/`](reviews/) に保存する。運用ルールは
[`.claude/rules/plan-review-workflow.md`](../.claude/rules/plan-review-workflow.md)。

## ステータスダッシュボード

| ステータス | Plan | 概要 | 関連 PR / レビュー | 推奨アクション |
|---|---|---|---|---|
| 🟡 実装中 | [Pleasanter 排除 + 1on1 再構築](plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) | 旧 1on1 を新スタック(Next.js/Postgres/GoTrue/RLS)で再構築。主要フロー実装済み + 見た目踏襲の基盤(シェル/テーマ)着手 | [計画レビュー: APPROVE（対応後）](reviews/2026-06-11-1830-pleasanter-exit-1on1-rebuild-review.md) / [コードレビュー(基盤): APPROVE](reviews/2026-06-12-0017-app-shell-theme-review.md) / PR #1–14 merged | 見た目踏襲の続き(各ページの定石化) |

> 全フェーズの決定・ハマりどころ（RLS 無限再帰 / GUC 予約語衝突 / 二層認可など）は
> [Plan の判断ログ](plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md#9-判断ログ)に時系列で記録。次セッションはまずそこを読む。

### 実装進捗

| Phase | 内容 | PR | 状態 |
|---|---|---|---|
| 0 | モノレポ + Next.js 16 + ui-catalog ベンダリング | #1–3 | ✅ merged |
| 1 | Docker(Postgres+拡張) + GoTrue + RLS context | #4, #5 | ✅ merged |
| 2 | データモデル + RLS + pgTAP | #6 | ✅ merged |
| 3 | API 層（DB クライアント + RLS 注入 + users API） | #7 | ✅ merged |
| 4 | 管理者画面: ユーザー管理 / アンケート管理 | #8, #9 | ✅ merged |
| 6 | CI（GitHub Actions: typecheck/build/pgTAP） | #10 | ✅ merged |
| 4+ | 設問ビルダ / 掲載管理 | #11, #12 | ✅ merged |
| 5a | 回答者フロー（実施中一覧→回答→保存） | #13 | ✅ merged |
| 5b | 面談フロー（answers API + 面談記録 + API層認可） | #14 | ✅ merged |
| 見た目1 | 見た目踏襲・基盤（テーマ3軸 + AppLayout シェル + ナビ + テーマ切替UI） | #15 | ✅ merged |

### 次セッションの起点

1. **見た目踏襲の続き**（基盤はマージ済み。全ページがシェル配下）: 各ページを ui-catalog 定石へ
   - 管理3画面の一覧 → `InteractiveTable`/`CardGrid` + `StatisticPanel` + `LoadingZone`
   - フォーム（user/survey/interview）→ `ContentBlock` + `FormField` + valibot
   - 回答者フロー（/surveys, /surveys/[publishId]）の定石化
2. 周辺: ダッシュボード / スケジュール / 委任、日時 tz、レートリミット、`.claude` の Gitea→GitHub 読み替え、実データ移行

### ローカル起動メモ

```bash
pnpm db:up            # postgres + gotrue
pnpm db:migrate       # スキーマ適用（冪等）
pnpm db:seed          # admin/member/alice 等
pnpm test:db          # pgTAP(RLS)
# web は env を渡して起動:
# GOTRUE_URL=http://localhost:9999 GOTRUE_JWT_SECRET=dev-only-change-me-please-32bytes-minimum \
#   DATABASE_URL=postgres://app_user:app@localhost:5432/waoon pnpm --filter @waoon/web start
```

seed ログイン: `admin@example.com` / `Admin1234!`（管理者）, `member@example.com` / `Member1234!`（一般）
