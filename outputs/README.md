# outputs — Plan / Review ダッシュボード

Plan は [`plans/`](plans/)、Review は [`reviews/`](reviews/) に保存する。運用ルールは
[`.claude/rules/plan-review-workflow.md`](../.claude/rules/plan-review-workflow.md)。

## ステータスダッシュボード

| ステータス | Plan | 概要 | 関連 PR / レビュー | 推奨アクション |
|---|---|---|---|---|
| 🟡 実装中 | [Pleasanter 排除 + 1on1 再構築](plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) | 旧 1on1 を新スタック(Next.js/Postgres/GoTrue/RLS)で再構築。主要フロー + 見た目踏襲（基盤〜管理〜回答者）+ provisioning / レートリミット / 日時tz までマージ済 | [計画](reviews/2026-06-11-1830-pleasanter-exit-1on1-rebuild-review.md) / [基盤](reviews/2026-06-12-0017-app-shell-theme-review.md) / [管理一覧](reviews/2026-06-12-0039-admin-lists-uicatalog-review.md) / [管理フォーム](reviews/2026-06-12-0112-admin-forms-uicatalog-review.md) / [回答者](reviews/2026-06-12-0134-respondent-flow-uicatalog-review.md) / [provisioning(security)](reviews/2026-06-12-1117-user-provisioning-review.md) / [レートリミット(security)](reviews/2026-06-12-1130-auth-rate-limit-review.md) / [日時tz](reviews/2026-06-12-1159-datetime-jst-review.md) / PR #1–21 merged | 一覧拡張 / ダッシュボード・スケジュール画面 |

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
| 見た目2 | 管理一覧の定石化（users/surveys/answers → InteractiveTable + AdminListTable） | #16 | ✅ merged |
| 見た目3 | 管理フォームの定石化（User/Survey/Interview → ContentBlock + FormField + FormActions） | #17 | ✅ merged |
| 見た目4 | 回答者フローの定石化（AnswerForm → ContentBlock+各コントロール / 一覧 → Card+Badge） | #18 | ✅ merged |
| 認証 | ユーザー作成時の GoTrue provisioning（identity 発行 + gotrue_id 紐付け + 初期パスワード生成） | #19 | ✅ merged |
| 認証 | レートリミット（login/refresh の IP 単位 in-memory limiter, 429+Retry-After） | #20 | ✅ merged |
| データ整合 | 日時 tz 修正（datetime-local の JST⇄UTC 変換、掲載/面談の instant ズレ解消） | #21 | ✅ merged |
| 新規画面 | ダッシュボード `/dashboard`（answers 集計: 回答状況/面談実施率/健康分布/評価レーダー、RLS スコープ） | #22 | ✅ merged |
| 新規画面 | スケジュール `/schedule`（schedules CRUD API + @ui-catalog MonthView/EventModal の共有カレンダー、RLS owner/admin write）。[コードレビュー: APPROVE](reviews/2026-06-12-1413-schedule-review.md) | `feature/schedule` | 🟣 マージ承認待ち |

### 次セッションの起点

見た目踏襲（基盤〜管理〜回答者）+ provisioning / レートリミット / 日時tz + ダッシュボード(merged) + スケジュール(レビュー済)。主要画面はほぼ揃った。残り:

1. **スケジュールの手動確認**: カレンダーの対話（日付クリック→作成モーダル / イベント編集 / ドラッグ移動）はブラウザでの動作確認が必要（curl 検証不能のため未確認）。
2. **見た目の磨き込み**: 一覧のフィルタ/ソート + `StatisticPanel`、フォームのフィールド単位 valibot エラー表示、数値 Input の min/max
3. **認証の残**: 編集時の email/password の GoTrue 同期、初回ログイン後の force-change、本番のエッジ(nginx)/Redis レートリミット
4. 周辺: 委任、`.claude` の Gitea→GitHub 読み替え、root scripts 整理（保留中）、実データ移行

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
