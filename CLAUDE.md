# CLAUDE.md — waoon

> 毎セッション投入される。詳細は実装の進行に合わせて追記し、本体は要約 + リンクに留める
> （200 行以下を維持。[docs-style.md](.claude/rules/docs-style.md) 参照）。

## プロジェクト概要

waoon は、旧 **1on1（アンケート／面談）アプリ**を技術選定メモのスタックで **再構築**する
プロジェクト。旧アプリがデータストア兼管理 UI に使っていた **Pleasanter を完全排除**し、
**Docker + PostgreSQL + GoTrue + RLS + API 一本化**へ移行する。

- 対象ドメイン（ユーザー / アンケート / 回答 / 面談）は旧 1on1 由来。
- スタック・開発思想は技術選定メモ由来。
- 実装はこれから着手（[詳細 Plan](outputs/plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) 参照）。

| 一次情報 | 場所 |
|---|---|
| 技術選定メモ（採否 + 確度 + 思想） | [doc/_techmemo-decoded.md](doc/_techmemo-decoded.md)（原本: `doc/技術選定メモ_*.Csv`） |
| 旧 1on1 ソース（**参照のみ・流用しない**） | [doc/legacy-1on1/](doc/legacy-1on1/) |
| 実装 Plan | [outputs/plans/](outputs/plans/) |

## 採用スタック（技術選定メモより）

| 領域 | 採用 |
|------|------|
| 言語 / FW | TypeScript / **Next.js 16 (App Router)** / React 19 |
| スタイル | Tailwind CSS v4 |
| 状態・データ取得 | TanStack Query（+ 旧踏襲で Jotai） |
| UI | ui-catalog（submodule + `link:`、Atomic Design / Radix + SCSS Modules 内部実装） |
| 認証 | GoTrue（JWT + Cookie、自前薄ラッパ） |
| DB | PostgreSQL 15 + 拡張（pgmq / pg_cron / pgvector / pgtap）。**RLS で認可** |
| 非同期 | pgmq / pg_cron（通知は非同期） |
| パッケージ / 構成 | pnpm + pnpm workspace（モノレポ） |
| コンテナ | Docker Compose（dev / stg / prod、stg/prod 同一構成） |
| テスト | Vitest / pgTAP（RLS・SQL）/ Playwright。テストピラミッド |
| Git ホスト | **GitHub**（`sasakiyusuke2017015/waoon`）+ GitHub Actions |
| 言語対応 | 初期は日本語のみ |

検討中: AI 機能 / LLM 基盤 / pgvector。将来検討: MinIO / MFA / reg-suit VRT / 2 テーマ。

## アーキテクチャ（目標）

```
nginx (TLS終端・ルーティング)
  → apps/web (Next.js: UI + API Routes + Server Actions + lib/auth)
       → postgres (RLS / pgmq / pg_cron)   ← app_user は public schema のみ
       → gotrue   (認証エンジン)            ← supabase_auth_admin は auth schema のみ
```

## 絶対方針（高確度・早期に効く制約）

- **DB アクセスは必ず API 経由**（Next.js API Route / Server Action）。SDK 直叩き・View 直公開・
  RPC は全て不採用（確度100 / 不採用確度 -90）。例外は GoTrue ログインのみ。
- **認可は API 層が主、RLS が最終ガード**。全業務テーブルに RLS（6 分類）。
- **後方互換は基本させない**（FailFast。移行スクリプトで一気に書き換える）。
- **新規 UI 部品は原則 ui-catalog に吸収**（使い捨てコンポーネントを作らない）。

## ドメイン（旧 1on1 由来）

主要エンティティ: `users` / `surveys` + `questions` / `survey_publications` / `answers` /
`schedules` / 組織マスタ（本部・部・課・役職）。ロールは組織階層 5 段階
（employee / section_head / department_head / division_head / admin）。
詳細・Pleasanter SiteId 対応は [Plan §3.2](outputs/plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)。

## .claude 構成

| ディレクトリ | 内容 |
|---|---|
| [rules/](.claude/rules/) | コーディング規約・Git / セキュリティ / テスト・Plan/Review 運用。`paths:` で条件付き読込のものと常時読込のものがある |
| [commands/](.claude/commands/) | スラッシュコマンド（/plan・/review・/pr-review・/tdd・/cleanup 等） |
| [agents/](.claude/agents/) | サブエージェント（planner / architect / tdd-guide / code-reviewer / security-reviewer 等） |
| [skills/](.claude/skills/) | スキル |
| [contexts/](.claude/contexts/) | dev / review / research コンテキスト |
| [hooks/](.claude/hooks/) | フック用スクリプト（settings.json への配線は未実施。有効化は別途） |
| [mcp-configs/](.claude/mcp-configs/) | MCP サーバ設定の参照テンプレート |

> この .claude 設定は別プロジェクト（ai-education）から汲み取り、waoon 向けに汎用化したもの。
> waoon 固有の前提が固まり次第、各 rules / commands を実態に合わせて更新する。

## Git 運用（確定事項）

- **ホスト**: GitHub（`origin = https://github.com/sasakiyusuke2017015/waoon.git`）。CI は `.github/workflows/`。
- **ブランチ戦略**: [git-workflow.md](.claude/rules/git-workflow.md) の **3 層 `feature→develop→main`** に統一
  （技術選定メモの GitHub Flow は不採用）。
- **`doc/legacy-1on1/` は `.gitignore`**（参照のみ。原本は `doc/1on1-main.zip`）。

## 残課題

- `.claude/rules/*`（git-workflow.md 等）に残る **Gitea / `tea` 前提の記述を GitHub / `gh` へ更新**する
  （ブランチ戦略は 3 層のまま、ホスト固有の記述だけ読み替え）。
