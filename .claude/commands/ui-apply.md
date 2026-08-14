# /ui-apply — 既存の @wanonwan/ui コンポーネントを apps に適用

apps 内の生 HTML/JSX マークアップを、既に catalog にあるコンポーネントに置き換える。**新規吸収ではなく既存資産の利用徹底**を目的とする。

## 使い方

```
/ui-apply <ファイルまたはディレクトリのパス> [--component <Name>]
```

例:

```
/ui-apply apps/web/src/app/(app)/courses/page.tsx
/ui-apply apps/web/src/app/(app) --component Card
```

引数なしの場合は apps/web 全体をスキャン。

## 処理フロー

1. **対象スキャン**
   - 引数のパスを起点に `*.tsx` を walk
   - catalog 提供コンポーネント名（Button/Card/CardHeader/CardBody/CardFooter/Badge/Input/FormField/Tabs/Spinner/Icon/ComingSoon 等）を **生で書かれていそうな箇所**を grep
     - `<button` `<input` などタグ直書き
     - `<div className="rounded-lg border ...">` のような Card 様マークアップ
     - インラインの Badge ライク span (`<span className="rounded-full bg-...-100 text-...-700 ...">`)

2. **置換候補の提案**
   - 各候補に対し：
     - 適用するコンポーネント名と props 案
     - before / after の差分プレビュー
     - 既存 className との衝突有無
   - ユーザが箇所ごと（または一括）承認

3. **置換実行**
   - `Edit` で行単位置換（`old_string` / `new_string` 厳密一致）
   - import を追加（既存の `@wanonwan/ui` import に merge）
   - 不要になった Tailwind utility は削除（catalog 側で内包されるため）

4. **検証**
   - `pnpm --filter @wanonwan/web typecheck`
   - dev サーバ稼働中なら HMR、停止中なら起動して該当ルートを HTTP プローブ
   - スクリーンショット差分まではこのコマンド単体ではやらない（必要なら `/e2e` で）

5. **コミット候補**
   - `refactor(ui): apply @wanonwan/ui to <scope>` メッセージ案を提示

## 適用パターン例

### 例1: Card 適用

before:
```tsx
<div className="rounded-lg border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-200 px-6 py-4">
    <h2>タイトル</h2>
  </div>
  <div className="px-6 py-4">{body}</div>
</div>
```

after:
```tsx
import { Card, CardHeader, CardBody } from '@wanonwan/ui/molecules'

<Card>
  <CardHeader><h2>タイトル</h2></CardHeader>
  <CardBody>{body}</CardBody>
</Card>
```

### 例2: Badge 適用

before:
```tsx
<span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
  合格
</span>
```

after:
```tsx
import { Badge } from '@wanonwan/ui/atoms'

<Badge tone="success">合格</Badge>
```

### 例3: ComingSoon 適用

before:
```tsx
<main className="mx-auto max-w-2xl px-6 py-16">
  <div className="rounded-lg border ...">
    <h1>機能名</h1>
    <p>説明</p>
  </div>
</main>
```

after:
```tsx
import { ComingSoon } from '@wanonwan/ui/organisms'

<ComingSoon title="機能名" description="説明" />
```

## サブパス import 規約

apps からは **必ずレイヤ単位のサブパス** (`@wanonwan/ui/atoms` / `/molecules` / `/organisms` / `/templates` / `/utils`) を使う。ルート (`@wanonwan/ui`) や深いパス (`@wanonwan/ui/core/...`) は禁止。

## 注意

- **catalog にまだ無いものは適用しない**。新規が必要なら `/ui-absorb` または手動作成。
- **デザイントークンを Tailwind utility で再現してしまっている箇所**を優先的に拾う。
- **className のカスタマイズが多すぎる場合**は、catalog 側に variant 追加が妥当（このコマンドの範囲外、`/ui-absorb` の対象）。
- **API 互換性**: catalog Button は `size: sm/md/lg` も `small/medium/large` も受ける（Phase 1 で拡張済み）、Badge は `tone` も `variant` も受ける。利用側の好みで OK。

## 関連

- `/ui-absorb` — apps の独自パーツを catalog へ昇格
- `packages/ui/package.json` の `exports` — 利用可能なコンポーネントの公開 surface
- `outputs/plans/2026-05-19-1931-ui-catalog-bidirectional-sync.md` — Phase 0〜5 の計画
