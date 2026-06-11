# waoon

旧 **1on1（アンケート／面談）アプリ**を、セルフホスト OSS スタックで再構築するプロジェクト。
旧アプリの **Pleasanter 依存（データストア兼管理 UI）を完全排除**し、
**Next.js 16 + PostgreSQL + GoTrue + RLS** へ移行する。

実装は未着手（設計フェーズ）。何をどう作るかは
[実装 Plan](outputs/plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) を一次情報とする。

## スタック

| 領域 | 採用 |
|---|---|
| FW / 言語 | Next.js 16 (App Router) / React 19 / TypeScript |
| DB | PostgreSQL 15 + 拡張（pgmq / pg_cron / pgvector / pgtap）、**RLS で認可** |
| 認証 | GoTrue（自前薄ラッパ） |
| データアクセス | **API 一本化**（Next.js API Routes / Server Actions のみ。SDK 直叩き不可） |
| UI | ui-catalog（submodule + `link:`）/ Tailwind CSS v4 / TanStack Query |
| 構成 | pnpm workspace モノレポ / Docker Compose（dev・stg・prod） |
| テスト | Vitest / pgTAP / Playwright |
| Git / CI | Gitea（セルフホスト）+ Gitea Actions |

詳細な採否・根拠は [doc/_techmemo-decoded.md](doc/_techmemo-decoded.md)（技術選定メモ）。

## このリポジトリの構成

```
waoon/
├── CLAUDE.md            プロジェクト概要 + AI 駆動開発の前提
├── README.md            ← このファイル
├── .claude/             Claude Code 用ルール・コマンド・エージェント・スキル
├── doc/
│   ├── _techmemo-decoded.md   技術選定メモ（採否 + 確度 + 開発思想）
│   ├── 技術選定メモ_*.Csv     原本（Shift-JIS）
│   └── legacy-1on1/           旧 1on1 ソース一式（参照のみ・コード流用しない）
└── outputs/
    ├── README.md        Plan / Review ステータスダッシュボード
    ├── plans/           実装前の Plan
    └── reviews/         Plan / 実装に対する Review
```

> 実装着手後、`apps/web` / `packages/*` / `infra/` / `outputs/infra-data/`（DDL・RLS・seed）が
> 追加される。構成の最終形は Plan §4 を参照。

## 開発の進め方

AI 駆動開発（Claude Code を主開発者）。設計→Plan→計画レビュー→実装→コードレビュー→PR の流れは
[.claude/rules/plan-review-workflow.md](.claude/rules/plan-review-workflow.md) と
[.claude/rules/git-workflow.md](.claude/rules/git-workflow.md) に従う。

起動コマンド・環境構築手順は、Plan の Phase 0–1（基盤・DB スタック）実装時にここへ追記する。
