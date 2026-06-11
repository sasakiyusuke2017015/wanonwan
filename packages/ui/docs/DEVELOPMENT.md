# @ui-catalog/core 開発ガイド

## 概要

ui-catalog は **Atomic Design ベースの汎用 UI コンポーネント雛形**。
**GitHub Template Repository** として配布し、各プロジェクトは「Use this template」で複製してから独立進化させる。

導入手順・運用方針については [README.md](../README.md) を参照してください。

### 配布モデルの要点

- ブランチは `main` 一本（プロジェクト別ブランチは持たない）
- 雛形 → 複製先 / 複製先 → 雛形 の自動同期は提供しない（複製時点でフォーク）
- 雛形の更新は雛形 repo で直接コミット。複製先には伝播しない
- 複製先で育てたコンポーネントを雛形に逆輸入したい場合は、雛形 repo 側で手で取り込む
- スタイルは **Tailwind v4 を主、SCSS Module を併用**（CSS-in-JS は不採用）

---

## ディレクトリ構造

```
ui-catalog/
├── core/                    # 純粋UI（ビジネスロジックゼロ）
│   ├── atoms/               #   最小単位（Button, Input, Badge, Icon 等）
│   ├── molecules/           #   atoms の組み合わせ（FormField, MenuItem 等）
│   ├── organisms/           #   molecules の組み合わせ（Dialog, Modal 等）
│   ├── templates/           #   ページレイアウト（AppShell, Header 等）
│   ├── hooks/               #   カスタムフック（useDevice, useDisclosure 等）
│   │   └── router/          #     ルーター抽象化（RouterContext）
│   ├── constants/           #   定数定義
│   ├── types/               #   共通型定義
│   ├── tokens/              #   デザイントークン（SCSS変数）
│   ├── styles/              #   グローバルスタイル
│   └── utils/               #   ユーティリティ（cn, isNullish 等）
│
│
├── infra/                   # 育成・観測の仕組み
│   ├── commands/            #   状態診断コマンド
│   ├── devtools/            #   操作ログ、デバッグツール
│   ├── version/             #   バージョン管理（VERSION_REGISTRY）
│   ├── theme/               #   テーマ機能
│   ├── storybook/           #   Storybook 設定
│   ├── scripts/             #   セットアップスクリプト
│   └── docker/              #   Docker 設定
│
├── docs/                    # ドキュメント
└── index.ts                 # エントリポイント
```

---

## Atomic Design 階層

| 階層 | 説明 | 例 |
|------|------|-----|
| **atoms** | 最小単位、それ以上分割できない | Button, Input, Icon, Badge, Checkbox |
| **molecules** | atoms の組み合わせ | FormField, MenuItem, SearchBar, DatePicker |
| **organisms** | molecules の組み合わせ、独立したセクション | Dialog, Modal, Card, LoginButton |
| **templates** | ページ全体のレイアウト構造 | AppShell, Header, Footer, SideNav |

### 依存方向

```
atoms ← molecules ← organisms ← templates
         ↑              ↑           ↑
      atoms のみ    atoms +     atoms +
       依存可能    molecules   molecules +
                  依存可能    organisms
                             依存可能
```

**逆方向の依存は禁止**（atoms が molecules に依存してはならない）。

---

## スタイリング方針

### Tailwind 主、SCSS Module 併用

ui-catalog は **Tailwind v4** を主スタイル方式とする。SCSS Module は Tailwind では表現しづらいケースで併用可。CSS-in-JS は採用しない。

| 方式 | 使用場所 | 備考 |
|------|---------|------|
| **Tailwind v4（推奨）** | core/、複製先の規約ゾーン両方 | `core/styles/tokens.css` の `@theme static` でトークン公開済み |
| SCSS Module | core/、規約ゾーン両方で許容 | 複雑なネスト、擬似要素、独自アニメーション等で有用 |
| CSS-in-JS（emotion / styled-components） | 不採用 | バンドルサイズと SSR 対応の都合 |

**現状の混在状況（意図的）:**

core/ には Tailwind 中心のコンポーネントと SCSS Module で書かれたコンポーネント（TabBar, Tabs, NavItem 等）が混在している。これは方針の不徹底ではなく、各コンポーネントの実装都合に応じた選択。書き換える必要はない。

### absorb 時のルール

`/ui-catalog absorb` は、**複製先プロジェクトの規約ゾーン（`src/ui/`）からコピーで取り込む**ことを前提とする。規約ゾーンは ui-catalog 互換で書かれている前提なので、原則として変換不要。

規約違反（プロジェクト固有モジュール import、ビジネスロジック混入等）が見つかった場合は、警告を出して対処を確認する（規約に合わせて修正してから取り込む / そのまま取り込んで後で develop で直す / キャンセル）。

参考までに、SCSS Module の実装例：

```scss
// core/atoms/Button/Button.module.scss
@use '../../tokens' as *;

.button {
  padding: $spacing-2 $spacing-4;
  border-radius: $radius-md;
  font-weight: $font-weight-medium;
  transition: all $transition-fast;

  &--primary {
    background-color: $color-primary;
    color: $color-white;
  }

  &--secondary {
    background-color: $color-secondary;
    color: $color-dark;
  }
}
```

### SCSS トークンの活用

```scss
// core/tokens/_index.scss
@forward 'colors';
@forward 'spacing';
@forward 'typography';
@forward 'shadows';
@forward 'borders';
@forward 'transitions';
```

```tsx
// コンポーネントでの使用
import styles from './Button.module.scss'

export const Button: FC<ButtonProps> = ({ variant = 'primary', children }) => (
  <button className={`${styles.button} ${styles[`button--${variant}`]}`}>
    {children}
  </button>
)
```

---

## エクスポート構成

| パス | 内容 |
|------|------|
| `@ui-catalog/core` | ルートエクスポート（全体） |
| `@ui-catalog/core/atoms` | 最小単位コンポーネント |
| `@ui-catalog/core/molecules` | atoms の組み合わせ |
| `@ui-catalog/core/organisms` | 独立したセクション |
| `@ui-catalog/core/templates` | ページレイアウト |
| `@ui-catalog/core/hooks` | カスタムフック |
| `@ui-catalog/core/constants` | 定数 |
| `@ui-catalog/core/types` | 型定義 |
| `@ui-catalog/core/tokens` | デザイントークン |
| `@ui-catalog/core/utils` | ユーティリティ |
| `@ui-catalog/core/styles` | グローバルCSS |
| `@ui-catalog/core/infra` | infra/ 全体 |

---

## テーマ機能

### 概要

`@ui-catalog/core/infra/theme` は localStorage 連携付きの完全なテーマ機能を提供します。

### 主要コンポーネント

| 名前 | 説明 |
|------|------|
| `ThemeProvider` | テーマ Context を提供 |
| `useTheme()` | colors, shapes を取得 |
| `useColorTheme()` | カラーテーマの取得・設定 |
| `useShapeTheme()` | 形状テーマの取得・設定 |
| `useBackgroundTheme()` | 背景テーマの取得・設定 |
| `useBackgroundStyle()` | 背景スタイル（CSS properties） |
| `useFullTheme()` | 全テーマ設定を一括取得 |

### localStorage キー

```
ui-catalog:colorTheme
ui-catalog:shapeTheme
ui-catalog:backgroundTheme
ui-catalog:tableRowAnimation
ui-catalog:cardAnimation
ui-catalog:dropMenuAnimation
ui-catalog:animationSpeed
```

---

## 開発ワークフロー

### 1. 発展（Develop）

新規コンポーネントの作成、または既存の拡張・修正。`/ui-catalog develop` で実行。

```
「ユーザー一覧を表示する UserListTable を作って」
「DatePicker に時間選択を追加して」
```

### 2. 吸収（Absorb）

別途参照可能な複製先プロジェクトの規約ゾーン（`src/ui/`）から ui-catalog 雛形に手で取り込む。`/ui-catalog absorb <path>` で実行。

```
/ui-catalog absorb ~/work/some-project/src/ui/organisms/ProfileCard
```

規約ゾーンは ui-catalog 互換で書かれている前提なので、原則として変換不要。

### 3. 洗練（Clean）

整合性チェックと未使用コード削除。`/ui-catalog clean` で実行。

```
「コードベースをクリーンアップして」
「ScoreBadge の Props を汎用化して」
```

---

## 複製先プロジェクトのガイダンス

複製先プロジェクトで新しい UI コンポーネントを作るときは、`src/ui/` に **規約ゾーン**を作って書く。詳細は [README.md](../README.md#規約ゾーンsrcui) を参照。

**汎用化価値があると判断したら**、雛形 repo 側で**手で取り込む**（コピー＆調整）。`/ui-catalog absorb` または `/ui-catalog develop` を雛形 repo 側で実行する。

> 自動同期は提供しない方針。複製時点でフォーク済みのため、雛形 ↔ 複製先の伝播は人間の判断で行う。

---

## 依存関係

```
molecules → atoms      ✅ OK
organisms → molecules  ✅ OK
organisms → atoms      ✅ OK
atoms → molecules      ❌ 禁止（逆方向）
```

### peerDependencies

- react, react-dom
- jotai（テーマ機能用）
- framer-motion

**スタイリング方針:** ui-catalog は Tailwind v4 を主、SCSS Module を併用。詳細は上の「スタイリング方針」章を参照。

---

## バージョン管理

### VERSION_REGISTRY（唯一のソースオブトゥルース）

`infra/version/registry.ts` の `VERSION_REGISTRY` がコンポーネントバージョンの正規データ。
`ui-catalog.versions.json` は VERSION_REGISTRY から自動生成される派生ファイル（手動編集禁止）。

```bash
# versions.json を VERSION_REGISTRY から生成
pnpm export-versions
```

### 初期化

```tsx
// src/main.tsx
import { initUICatalog } from '@ui-catalog/core'
import versions from './ui-catalog.versions.json'

initUICatalog(versions)
```

---

## 操作ログ（DevTools）

開発環境でUIコンポーネントの操作を追跡するための仕組みです。

### 設定

```tsx
// apps/web/src/main.tsx
import { configureDevTools } from '@ui-catalog/core'

if (import.meta.env.DEV) {
  configureDevTools({
    enabled: true,          // ログ機能を有効化
    logOperations: true,    // 操作ログを出力
    consoleOutput: true,    // ブラウザコンソールに出力
    serverOutput: false,    // サーバー（Docker stdout）に出力
    serverEndpoint: '/api/dev/log',  // サーバーログのエンドポイント
    uidPrefix: 'myapp',     // ログのプレフィックス
  })
}
```

### コンポーネントへの組み込み

```tsx
import { useOperationLog } from '../hooks/useOperationLog'

const MyComponent: FC<Props> = ({ label, onAction }) => {
  const log = useOperationLog('MyComponent')

  const handleClick = () => {
    log('click', { label })
    onAction?.()
  }

  return <button onClick={handleClick}>{label}</button>
}
```

---

## チェックリスト

### コンポーネント作成時

- [ ] 配置場所は適切か（atoms/molecules/organisms/templates）
- [ ] 命名規則に従っているか
- [ ] atoms/hooks を活用しているか
- [ ] バレルエクスポートを追加したか
- [ ] VERSION_REGISTRY に追加したか
- [ ] data-component 属性を追加したか
- [ ] 操作ログ（useOperationLog）を追加したか

### absorb 時（複製先プロジェクトの src/ui/ → core/）

- [ ] 参照元が ui-catalog 規約に従っているか確認したか（依存方向、ビジネスロジック禁止）
- [ ] 規約違反があれば対処方針を決めたか（修正してから取り込む / そのまま取り込む / キャンセル）
- [ ] ビジネスロジックの混入が無いか
- [ ] Props を汎用的にしたか
- [ ] テスト・ストーリーを追加したか
- [ ] VERSION_REGISTRY に登録したか
- [ ] `tsc --noEmit` でエラーがないか確認したか
- [ ] `storybook build` が成功するか確認したか

### バージョン更新時

- [ ] 後方互換性は保たれているか
- [ ] VERSION_REGISTRY のバージョンを上げたか
- [ ] `pnpm export-versions` を実行したか
