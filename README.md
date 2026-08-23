# Wanonwan

**アンケートと面談**を通じて組織の 1on1 を支援するアプリケーション。
セルフホスト OSS スタック（**Next.js 16 + PostgreSQL + GoTrue + RLS**）で構築する。

主要機能（認証 / データモデル + RLS / API / 管理・回答・面談画面 / ダッシュボード /
スケジュール）は実装・マージ済み。デプロイ基盤と一部認証フローを検証中。進行状況は
[outputs ダッシュボード](outputs/README.md)。

ローカル起動・テスト・PR の手順は [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)。

## スタック

| 領域 | 採用 |
|---|---|
| FW / 言語 | Next.js 16 (App Router) / React 19 / TypeScript |
| DB | PostgreSQL 15 + 拡張（pgmq / pg_cron / pgvector / pgtap）、**RLS で認可** |
| 認証 | GoTrue（自前薄ラッパ） |
| データアクセス | **API 一本化**（Next.js API Routes / Server Actions のみ。SDK 直叩き不可） |
| UI | ui-catalog（`packages/ui` にベンダリング = pnpm workspace）/ Tailwind CSS v4 / TanStack Query |
| 構成 | pnpm workspace モノレポ / Docker Compose（dev・stg・prod） |
| テスト | Vitest / pgTAP / Playwright |
| Git / CI | GitHub（`sasakiyusuke2017015/wanonwan`）+ GitHub Actions |

## このリポジトリの構成

```
wanonwan/
├── CLAUDE.md            プロジェクト概要 + AI 駆動開発の前提
├── README.md            ← このファイル
├── apps/web/            Next.js アプリ（UI + API Routes + Server Actions + lib/auth）
├── packages/            共有パッケージ（@wanonwan/ui / auth / domain / db）
│   └── db/              DDL・RLS・seed・pgTAP（db:migrate / provision:{env} / test:db で適用）
├── infra/               Docker Compose（dev/stg/prod）+ nginx + Dockerfile.web
├── scripts/             db-migrate / provision（+ provision/ ステップ）/ check-secrets 等
├── docs/                ドキュメント全般
│   ├── CONTRIBUTING.md        開発者ガイド（起動・テスト・PR）
│   └── troubleshooting.md     ローカル開発のトラブルシュート
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
