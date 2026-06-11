# @ui-catalog/core

> **このリポジトリは雛形（GitHub Template Repository）です。** 各プロジェクトは「Use this template」で複製し、独立リポジトリとして自由に育ててください。

Atomic Design ベースの汎用 UI コンポーネント雛形。

---

## 配布モデル

ui-catalog は **GitHub Template Repository**。`npm publish` はしない。submodule 同期もしない。

```
ui-catalog (雛形 repo)
    │
    │ 「Use this template」で複製（履歴は引き継がない）
    ▼
親プロジェクト (独立 repo として自由に編集)
```

| 観点 | この repo の方針 |
|------|-----------------|
| 配布形態 | **GitHub Template**（複製後は独立リポジトリ） |
| 親 → ui-catalog の同期 | **提供しない**。汎用化価値があるものは ui-catalog 側で力技で取り込む |
| ui-catalog → 親 の同期 | **提供しない**。複製時点でフォーク。以降は独立進化 |
| ブランチ運用 | **`main` 一本**。プロジェクト別ブランチは持たない |

---

## 構造

```
ui-catalog/
├── core/                    # 純粋UI（ビジネスロジックゼロ）
│   ├── atoms/               #   最小単位（Button, Input, Icon, Badge 等）
│   ├── molecules/           #   atoms の組み合わせ（FormField, DatePicker 等）
│   ├── organisms/           #   独立したセクション（Dialog, Modal, Select 等）
│   ├── templates/           #   ページレイアウト（Header, AppShell 等）
│   ├── hooks/               #   カスタムフック
│   ├── tokens/              #   デザイントークン
│   ├── constants/ types/ utils/ styles/
│
├── infra/                   # 観測・バージョン管理
│   ├── devtools/            #   操作ログ
│   ├── version/             #   VERSION_REGISTRY
│   ├── theme/               #   テーマ
│   ├── storybook/           #   Storybook 設定
│   ├── eslint/              #   複製先プロジェクト向け ESLint 設定（src/ui/ 規約ゾーン用）
│
└── docs/                    # 詳細ドキュメント
```

---

## インポート例

```typescript
import { Button, Icon, Input } from '@ui-catalog/core/atoms'
import { FormField, DatePicker } from '@ui-catalog/core/molecules'
import { Modal, Dialog, Select } from '@ui-catalog/core/organisms'
import { Header, AppShell } from '@ui-catalog/core/templates'

import { useDevice, useDisclosure } from '@ui-catalog/core/hooks'
import { cn } from '@ui-catalog/core/utils'
```

詳細な export 一覧は [package.json](./package.json) の `exports` を参照。

---

## peerDependencies の install 方針

ui-catalog は **必須 peer 4 個 / optional peer 17 個** という構造。複製先で必要なものだけ install すればよく、使わない機能の依存は入れる必要がない。

### 全プロジェクトで必須（4個）

```bash
pnpm add react react-dom clsx tailwind-merge
```

### 機能別 optional（使う機能だけ install）

| 使う機能 | 追加で必要な peer |
|---|---|
| `Animated`, `NumberTicker`, `Segment`, `BlurFade` 等のアニメーション | `framer-motion` |
| `Calendar`, `MonthView`, `WeekView`, `EventModal` 等のカレンダー機能 | `jotai` `date-fns` |
| `TrendChart`, `PieChart` | `recharts` |
| `NavItem` 等のルーティング連動 | `react-router-dom` |
| `SortableToggleList` | `@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities` |
| `InteractiveTable` の仮想スクロール | `@tanstack/react-virtual` |
| `MarkdownEditor` | `@codemirror/commands` `@codemirror/lang-markdown` `@codemirror/language` `@codemirror/state` `@codemirror/view` `@lezer/highlight` |
| `MarkdownPreview` | `marked` |
| `MathView`（数式表示） | `katex` |

例：カレンダーとアニメーションだけ使うプロジェクト：

```bash
pnpm add react react-dom clsx tailwind-merge framer-motion jotai date-fns
```

使わないコンポーネントを `core/` から削除すれば、その peer も不要になり、`pnpm install` で警告が出ることもない。

---

## 「規約ゾーン」（src/ui/）— 推奨パターン

複製先プロジェクトで UI を分離管理したい場合は、`src/ui/` を**規約ゾーン**として運用することを推奨する。雛形と互換性を保てるので、後から雛形へ逆輸入しやすい。

```
src/
├── ui/              ← 規約ゾーン（atomic 構造を維持）
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── features/        ← 業務ゾーン（自由）
└── pages/           ← 業務ゾーン（自由）
```

### ゾーン内の【違反】ルール

ゾーンを設けたら、以下は機械的に守る前提。

| ルール | ESLint で機械チェック |
|---|---|
| ディレクトリ構造（atoms/molecules/organisms/templates） | path filter で前提 |
| 深い import 禁止（`@ui-catalog/core/*/*`） | `no-restricted-imports` |
| プロジェクト固有モジュール（`@/*` 等）の import 禁止 | `no-restricted-imports` |
| 依存方向違反（atoms → molecules 等） | **未実装**（カスタムルール必要） |
| ビジネスロジック禁止（fetch / axios 等を `src/ui/` 内に書かない） | **未実装** |

未実装のものは現状コードレビューで担保する。

### ゾーン内の【推奨】ルール

人間のレビューで判断する。プロジェクト事情で逸脱可。

- スタイルは **Tailwind v4** を推奨。SCSS Module 併用も可（CSS-in-JS は避ける）
- `core/styles/tokens.css` の Tailwind トークンを使う（直書き値より優先）
- Storybook story を併設する
- `data-component` 属性を付ける（devtools 連動のため）
- 1コンポーネント 1 ディレクトリ
- ファイル長は 200-400 行を目安

### ESLint 設定の使い方

`infra/eslint/parent-strict.cjs` を `.eslintrc.cjs` の override で extends する:

```javascript
module.exports = {
  overrides: [
    {
      files: ['src/ui/**/*.{ts,tsx}'],
      extends: ['./infra/eslint/parent-strict.cjs'],
    },
  ],
}
```

### 雛形へ逆輸入したくなったら

複製先で書いたコンポーネントが汎用化価値ありそうだと判断したら、ui-catalog 雛形 repo 側で**手で取り込む**（コピー＆調整）。自動同期は提供しない方針。

---

## ui-catalog 雛形側での開発

雛形 repo 自体を clone して作業する：

```bash
git clone https://github.com/sasakiyusuke2017015/ui-catalog.git
cd ui-catalog
pnpm install
pnpm storybook:localhost   # http://localhost:6006
```

変更したらそのまま `main` にコミット → push。複製先プロジェクトには伝播しない（複製時点でフォーク済み）。

### Claude Code コマンド

| コマンド | やること |
|---------|---------|
| `/ui-catalog` | 状態診断 |
| `/ui-catalog develop` | 新規コンポーネント作成・既存改修 |
| `/ui-catalog absorb <path>` | 別途参照可能な複製先プロジェクトの src/ui/ から手で取り込む |
| `/ui-catalog clean` | 整合性チェック・修正・未使用コード削除 |

詳細は [.claude/commands/ui-catalog.md](./.claude/commands/ui-catalog.md) を参照。

---

## Storybook

公開: https://sasakiyusuke2017015.github.io/ui-catalog/

```bash
pnpm storybook:localhost            # ローカル（http://localhost:6006）
pnpm storybook:deploy               # Chromatic にデプロイ（手動）
pnpm storybook:deploy:ghpages       # GitHub Pages にデプロイ
```

### Chromatic 自動デプロイ（雛形 repo のみ）

雛形 repo では `.github/workflows/chromatic.yml` により、main への push と PR で Chromatic に自動デプロイされる。

このワークフローは `if: github.repository == 'sasakiyusuke2017015/ui-catalog'` で雛形 repo に限定されており、**複製先プロジェクトでは何もせず skip される**（GitHub Actions のログにエラーは出ない）。

**複製先で Chromatic を有効化したい場合:**
1. https://www.chromatic.com で自プロジェクトを作成し Project Token を取得
2. 自リポジトリの GitHub Settings → Secrets → Actions に `CHROMATIC_PROJECT_TOKEN` として登録
3. `.github/workflows/chromatic.yml` の `if:` 行を削除するか、自リポジトリ名（`owner/repo` 形式）に書き換える

**複製先で Chromatic を使わない場合:**
何もしなくてよい。`.github/workflows/chromatic.yml` を残しても skip されるだけ。気になるなら削除可。

---

## 各層の責務

| 層 | 責務 | ビジネスロジック |
|----|------|-----------------|
| core/atoms | 最小UIブロック | 禁止 |
| core/molecules | atoms の組み合わせ | 禁止 |
| core/organisms | 独立したセクション | 禁止 |
| core/templates | ページレイアウト | 禁止 |
| core/hooks | カスタムフック | 禁止 |
| core/tokens | デザイントークン | 禁止 |
| infra/ | 観測・バージョン管理 | N/A |

依存方向：

```
atoms ← molecules ← organisms ← templates
```

逆方向の依存は禁止。

---

## バージョン更新ルール

コンポーネント変更時は同じコミットで [VERSION_REGISTRY](./infra/version/) と
[ui-catalog.versions.json](./ui-catalog.versions.json) を更新。

| 変更の種類 | バージョン |
|-----------|-----------|
| UI に変更なし（内部リファクタ等） | **patch** |
| UI に変更あり（props 追加、見た目変更等） | **minor** |
| 破壊的変更（props 削除/改名、API 変更） | **major** |

---

## 詳細ドキュメント

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - アーキテクチャ詳細
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) - 開発ガイド
- [docs/DESIGN.md](./docs/DESIGN.md) - デザイン方針
