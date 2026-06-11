# ui-catalog アーキテクチャ

## 思想

ui-catalog は **Atomic Design ベースの汎用 UI コンポーネント雛形**。
**GitHub Template Repository** として配布し、各プロジェクトは「Use this template」で複製してから独立進化させる。

### 配布モデル

- ブランチは `main` 一本（`project/<name>` ブランチは持たない）
- 雛形 ↔ 複製先 の自動同期は提供しない（複製時点でフォーク、独立進化）
- ソースは TS のまま含む（`dist` ビルドなし）。複製先で transpile される

```
┌─────────────────────────────────────────────────────┐
│  ui-catalog                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  【コア資産】                                       │
│  core/                                              │
│    atoms/                                           │
│    molecules/                                       │
│    organisms/                                       │
│    templates/                                       │
│    hooks/                                           │
│    types/ utils/ tokens/                            │
│                                                     │
│  【観測機構】                                        │
│  infra/                                             │
│    devtools/（操作ログ）                             │
│    version/（VERSION_REGISTRY）                     │
│    theme/                                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### スタイリング方針

ui-catalog は **Tailwind v4 を主、SCSS Module を併用**する。

- `core/styles/tokens.css` で `@theme static` ディレクティブを使い、デザイントークンを Tailwind ユーティリティとして公開
- 各コンポーネントは Tailwind を中心に実装。複雑なネストや独自アニメーション等で SCSS Module を併用可
- CSS-in-JS（emotion / styled-components）は不採用

---

## ディレクトリ構造

```
ui-catalog/
├── core/                    # 純粋UI（ビジネスロジックゼロ）
│   ├── atoms/               #   最小単位（Button, Input, Icon 等）
│   │   ├── Animated/
│   │   ├── Box/
│   │   ├── Button/
│   │   ├── Icon/
│   │   ├── Input/
│   │   ├── Stack/
│   │   └── Text/
│   │
│   ├── molecules/           #   atoms の組み合わせ
│   │   ├── Banner/
│   │   ├── Breadcrumb/
│   │   ├── Card/
│   │   ├── DatePicker/
│   │   ├── FilterField/
│   │   ├── FormField/
│   │   └── MenuItem/
│   │
│   ├── organisms/           #   独立したセクション
│   │   ├── AlertDialog/
│   │   ├── Dialog/
│   │   ├── LoginButton/
│   │   ├── Modal/
│   │   ├── Select/
│   │   └── Tabs/
│   │
│   ├── templates/           #   ページレイアウト
│   │   ├── AppShell/
│   │   ├── Footer/
│   │   ├── Header/
│   │   ├── SideNav/
│   │   └── SubHeader/
│   │
│   ├── hooks/               #   UIフック
│   │   ├── useDevice.ts
│   │   ├── useRemountKey.ts
│   │   ├── router/          #     ルーター抽象化
│   │   ├── ui/              #     UI系フック（useDisclosure等）
│   │   └── calend/          #     カレンダー系フック + state
│   │
│   ├── tokens/              #   デザイントークン（SCSS変数）
│   ├── constants/           #   定数定義
│   ├── types/               #   共通型定義（calend.ts 含む）
│   ├── utils/               #   ユーティリティ（calend/ 含む）
│   ├── styles/              #   グローバルスタイル
│   └── index.ts             #   core/ バレルエクスポート
│
├── infra/                   # 育成・観測の仕組み
│   ├── devtools/            #   開発ツール
│   ├── version/             #   バージョン管理
│   ├── theme/               #   テーマ機能
│   ├── storybook/           #   Storybook 設定
│   ├── scripts/             #   セットアップスクリプト
│   ├── commands/            #   状態診断コマンド
│   └── docker/              #   Docker 設定
│
├── docs/                    # ドキュメント
│   ├── DEVELOPMENT.md
│   └── ARCHITECTURE.md
│
└── index.ts                 # ルートエクスポート
```

---

## SCSS Module 実装例

```scss
// core/atoms/Button/Button.module.scss
@use '../../tokens' as *;

.button {
  padding: $spacing-2 $spacing-4;
  border-radius: $radius-md;

  &--primary {
    background-color: $color-primary;
  }
}
```

---

## Atomic Design 階層

| 階層 | 説明 | 例 |
|------|------|-----|
| **atoms** | 最小単位、それ以上分割できない | Button, Input, Icon, Badge |
| **molecules** | atoms の組み合わせ | FormField, MenuItem, DatePicker |
| **organisms** | molecules の組み合わせ、独立セクション | Dialog, Modal, LoginButton |
| **templates** | ページ全体のレイアウト構造 | AppShell, Header, Footer |

### 依存方向

```
atoms ← molecules ← organisms ← templates
```

**逆方向の依存は禁止**（atoms が molecules に依存してはならない）。

---

## 各層の責務

| 層 | 責務 | ビジネスロジック | 外部依存 |
|----|------|-----------------|---------|
| **core/atoms** | 最小UIブロック | ❌ 禁止 | React のみ |
| **core/molecules** | atoms の組み合わせ | ❌ 禁止 | atoms |
| **core/organisms** | 独立したセクション | ❌ 禁止 | atoms, molecules |
| **core/templates** | ページレイアウト | ❌ 禁止 | atoms, molecules, organisms |
| **core/hooks** | UIフック | ❌ 禁止 | React のみ |
| **core/tokens** | デザイン値の定義 | ❌ 禁止 | なし |
| **core/constants** | 定数定義 | ❌ 禁止 | なし |
| **core/types** | 共通型定義 | ❌ 禁止 | なし |
| **core/utils** | ユーティリティ関数 | ❌ 禁止 | なし |
| **core/styles** | グローバルCSS | ❌ 禁止 | なし |
| **core/hooks/calend/** | カレンダードメインフック | ❌ 禁止 | core/types, core/utils |
| **infra/** | 観測・バージョン管理 | N/A | 環境依存OK |

---

## 依存関係

```
core/tokens
    ↓
core/types, core/utils
    ↓
core/hooks
    ↓
core/atoms → core/molecules → core/organisms → core/templates
                                    ↓
                              apps/web/src/
```

**ルール:**
- 下から上への依存は禁止（atoms → molecules は ❌）
- ドメイン支援（hooks/calend/, types/calend.ts, utils/calend/）はコンポーネントから参照可能

---

## 開発フロー

### 1. ui-catalog 単独で開発

```bash
git clone https://github.com/sasakiyusuke2017015/ui-catalog.git
cd ui-catalog
pnpm install
pnpm storybook:localhost
```

新規コンポーネントは `main` に直接コミットして push。

**コンポーネント追加時の必須作業:**
- 適切な Atomic Design 層（atoms/molecules/organisms/templates）への配置
- スタイルは Tailwind v4 主、SCSS Module 併用可（CSS-in-JS は不採用）
- ビジネスロジックを混入させない
- VERSION_REGISTRY 登録
- Storybook story の作成

### 2. 複製先プロジェクトでの新規 UI

複製先プロジェクトで新しい UI コンポーネントを作るときは、`src/ui/` を **規約ゾーン**として運用する。詳細は [README.md](../README.md#規約ゾーンsrcui) を参照。

**規約ゾーンの位置づけ:**
- ディレクトリ構造は ui-catalog の `core/` と同じ（atoms / molecules / organisms / templates）
- スタイルは Tailwind v4 推奨、SCSS Module 併用可（CSS-in-JS は避ける）
- ビジネスロジック禁止
- 依存方向: atoms ← molecules ← organisms ← templates
- ESLint 縛りは `infra/eslint/parent-strict.cjs` を `.eslintrc.cjs` で extends

**雛形への逆輸入:**
- 自動同期は提供しない（複製時点でフォーク済み、独立進化）
- 汎用化価値があると判断したら、雛形 repo 側で**手で取り込む**（コピー＆調整）
- 雛形側で `/ui-catalog absorb` または `/ui-catalog develop` を使って取り込む

**ドメイン固有の支援ファイル（hooks/types/utils）の配置:**

カレンダーのように複数コンポーネントが型・hooks・utils を共有する場合:

```
core/hooks/calend/      ← ドメインフックと state
core/types/calend.ts    ← ドメイン型定義
core/utils/calend/      ← ドメインユーティリティ
```

### 禁止操作

- 公開ブランチに対する `rebase`
- `force push`（`--force`, `--force-with-lease` いずれも）
- `reset --hard` で他ブランチの内容を上書き

---

## エクスポート構成

```typescript
// @ui-catalog/core - ルートエクスポート
export * from './core'        // core/ 全体
export * from './infra'       // infra/ 全体
```

### インポート例

```typescript
import { Button, Icon } from '@ui-catalog/core/atoms'
import { FormField } from '@ui-catalog/core/molecules'
import { Modal, Dialog } from '@ui-catalog/core/organisms'
import { AppShell } from '@ui-catalog/core/templates'

import { useOperationLog } from '@ui-catalog/core/infra/devtools'
import { ThemeProvider } from '@ui-catalog/core/infra/theme'
```

---

## チェックリスト

### コンポーネント追加時

- [ ] 適切な層に配置したか（atoms/molecules/organisms/templates）
- [ ] ビジネスロジックが混入していないか
- [ ] スタイルは Tailwind v4 主、SCSS Module 併用可（CSS-in-JS は不採用）
- [ ] `core/styles/tokens.css` のトークンを使ったか（直書き値より優先）
- [ ] Props を汎用的にしたか（特定アプリの都合を反映していないか）
- [ ] 操作ログ（useOperationLog）を追加したか
- [ ] data-component 属性を追加したか
- [ ] VERSION_REGISTRY に登録したか
- [ ] Storybook story を作成したか
- [ ] `tsc --noEmit` でエラーがないか確認したか
- [ ] `storybook build` が成功するか確認したか
