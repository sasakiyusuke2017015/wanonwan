# outputs — Plan / Review ダッシュボード

Plan は [`plans/`](plans/)、Review は [`reviews/`](reviews/) に保存する。運用ルールは
[`.claude/rules/plan-review-workflow.md`](../.claude/rules/plan-review-workflow.md)。

## ステータスダッシュボード

| ステータス | Plan | 概要 | 関連 PR / レビュー | 推奨アクション |
|---|---|---|---|---|
| 🟡 実装中 | [Pleasanter 排除 + 1on1 再構築](plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) | 旧 1on1 を新スタック(Next.js/Postgres/GoTrue/RLS)で再構築。管理者2画面新規 + 回答者フル移植 | [計画レビュー: APPROVE（対応後）](reviews/2026-06-11-1830-pleasanter-exit-1on1-rebuild-review.md) / PR #1–9 merged | Phase 5(回答者フロー/見た目踏襲) or 設問ビルダ |

### 実装進捗（develop 取り込み済み）

| Phase | 内容 | PR |
|---|---|---|
| 0 | モノレポ + Next.js 16 + ui-catalog ベンダリング | #1, #2, #3 |
| 1 | Docker(Postgres+拡張) + GoTrue + RLS context | #4, #5 |
| 2 | データモデル + RLS + pgTAP | #6 |
| 3 | API 層（DB クライアント + RLS 注入 + users API） | #7 |
| 4 | 管理者画面: ユーザー管理 / アンケート管理 | #8, #9 |
| 6 | CI（GitHub Actions: typecheck/build/pgTAP） | 進行中 |

残: Phase 5(回答者フロー・見た目踏襲)、設問ビルダ/掲載管理、レートリミット、実データ移行、`.claude` の Gitea→GitHub 読み替え。
