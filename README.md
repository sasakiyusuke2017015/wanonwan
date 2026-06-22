# waoon

旧 **1on1（アンケート／面談）アプリ**を、セルフホスト OSS スタックで再構築するプロジェクト。
旧アプリの **Pleasanter 依存（データストア兼管理 UI）を完全排除**し、
**Next.js 16 + PostgreSQL + GoTrue + RLS** へ移行する。

主要機能（認証 / データモデル + RLS / API / 管理・回答・面談画面 / ダッシュボード /
スケジュール）は実装・マージ済み。デプロイ基盤と一部認証フローを検証中。進行状況は
[outputs ダッシュボード](outputs/README.md)、設計の一次情報は
[実装 Plan](outputs/plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)。

ローカル起動・テスト・PR の手順は [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)。

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
| Git / CI | GitHub（`sasakiyusuke2017015/waoon`）+ GitHub Actions |

詳細な採否・根拠は [docs/技術選定/_techmemo-decoded.md](docs/技術選定/_techmemo-decoded.md)（技術選定メモ）。

## このリポジトリの構成

```
waoon/
├── CLAUDE.md            プロジェクト概要 + AI 駆動開発の前提
├── README.md            ← このファイル
├── apps/web/            Next.js アプリ（UI + API Routes + Server Actions + lib/auth）
├── packages/            共有パッケージ（@waoon/ui / auth / domain / db）
│   └── db/              DDL・RLS・seed・pgTAP（db:migrate / db:seed / test:db で適用）
├── infra/               Docker Compose（dev/stg/prod）+ nginx + Dockerfile.web
├── scripts/             db-migrate / db-seed / provision / check-secrets 等
├── docs/                ドキュメント全般
│   ├── CONTRIBUTING.md        開発者ガイド（起動・テスト・PR）
│   ├── troubleshooting.md     ローカル開発のトラブルシュート
│   ├── 技術選定/              技術選定メモ（decoded + 原本 Shift-JIS CSV）
│   └── 99_archive/            旧 1on1 原本 zip + legacy-1on1/（参照のみ・gitignore）
├── .claude/             Claude Code 用ルール・コマンド・エージェント・スキル
└── outputs/
    ├── README.md        Plan / Review ステータスダッシュボード
    ├── plans/           実装前の Plan
    └── reviews/         Plan / 実装に対する Review
```

## 開発の進め方

AI 駆動開発（Claude Code を主開発者）。設計→Plan→計画レビュー→実装→コードレビュー→PR の流れは
[.claude/rules/plan-review-workflow.md](.claude/rules/plan-review-workflow.md) と
[.claude/rules/git-workflow.md](.claude/rules/git-workflow.md) に従う。

ローカル起動・環境構築・テスト・PR 手順は [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)、
詰まったときは [docs/troubleshooting.md](docs/troubleshooting.md)。
