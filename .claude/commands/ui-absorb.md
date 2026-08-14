# /ui-absorb — アプリ内パーツを @wanonwan/ui へ吸収

apps 配下に書かれた汎用 UI パーツを `packages/ui/core/{atoms,molecules,organisms,templates}/` へ昇格させ、apps 側を `@wanonwan/ui/*` のサブパス import に書き換える。

## 使い方

```
/ui-absorb <絶対パス または apps/web からの相対パス>
```

例:

```
/ui-absorb apps/web/src/components/SomeComponent.tsx
/ui-absorb apps/web/src/components/AppShell/Sidebar.tsx
```

## 前提

- 対象は **アプリ固有ロジックを含まない**プレゼンテーション寄りのコンポーネントであること。
  - API fetch / Next.js router / セッション読み取りなどに直接依存しない。
  - 該当する場合は、まず純粋表示部を切り出してからこのコマンドを実行する。
- catalog のレイヤ順序（atoms → molecules → organisms → templates）を逆走しないこと。

## 処理フロー

1. **分析**
   - 対象ファイルを Read し、props・依存関係・SCSS 有無を確認
   - JSX の構造から推定レイヤを決める：
     - 単一要素 = atoms
     - 既存 atoms の組み合わせ = molecules
     - 複数 molecules + 業務的意味 = organisms
     - ページレイアウト骨格 = templates
   - 推定レイヤと配置先パスをユーザに提示し承認を得る（`AskUserQuestion`）

2. **重複チェック**
   - `packages/ui/core/{layer}/<Name>/` が既に存在しないか確認
   - 似た役割の既存コンポーネント（例: `EmptyState` ↔ `ComingSoon`）を grep で探し、重複の場合は別名提案

3. **ファイル移動**
   - `packages/ui/core/{layer}/<Name>/<Name>.tsx` に配置
   - `packages/ui/core/{layer}/<Name>/index.ts` を生成（`export { Name, default } from './Name'`）
   - import 文の `@wanonwan/ui/*` → 相対パス（catalog 内は相対）に書き換え
   - React hooks を使う場合は `'use client'` を明記する

4. **barrel 更新**
   - `packages/ui/core/{layer}/index.ts` に `export * from './<Name>'` を追加

5. **apps 側 import の置換**
   - `grep -rln "@/components/<Name>" apps/` で全参照を検出
   - `sed` で `import { <Name> } from '@/components/<Name>'` → `import { <Name> } from '@wanonwan/ui/{layer}'` に置換
   - 元ファイル `apps/web/src/components/<Name>.tsx` を `rm`

6. **検証**
   - `pnpm --filter @wanonwan/ui typecheck`
   - `pnpm --filter @wanonwan/web typecheck`
   - dev サーバが起動中なら HMR 経由、停止中なら起動して影響を受けるルートを HTTP プローブ
   - キャッシュ起因のビルドエラーが残る場合: `docker compose -f infra/docker-compose.yml restart web` + `.next/cache` クリア

7. **コミット候補**
   - 差分サマリを表示し、`feat(ui): absorb <Name> into @wanonwan/ui (<layer>)` のメッセージ案を提示

## レイヤ判定の指針

| 内容 | レイヤ | barrel |
|---|---|---|
| ボタン・タグ・アイコンなど単機能 | atoms | `packages/ui/core/atoms/index.ts` |
| FormField / Card / Tabs など atoms の組み合わせ | molecules | `packages/ui/core/molecules/index.ts` |
| EmptyState / Dialog / Modal / ComingSoon | organisms | `packages/ui/core/organisms/index.ts` |
| AppShell / Header+Sidebar 構成 | templates | `packages/ui/core/templates/index.ts` |

迷ったら organisms に置いてから後で評価する。

## サブパス import 規約

apps からの import は **必ずレイヤ単位のサブパス**を使う:

```ts
// 良い
import { Badge } from '@wanonwan/ui/atoms'
import { Card, CardBody, Button } from '@wanonwan/ui/molecules'
import { ComingSoon } from '@wanonwan/ui/organisms'
import { cn } from '@wanonwan/ui/utils'

// 悪い（ルートからの import は重い deps まで bundle されやすい）
import { Badge, Card, ComingSoon } from '@wanonwan/ui'

// 悪い（深い内部パス禁止）
import { Badge } from '@wanonwan/ui/core/atoms/Badge/Badge'
```

サブパス定義は `packages/ui/package.json` の `exports` を参照。

## 注意

- **アプリ固有ロジック（fetch・router）は持ち込まない**。`LogoutButton` のように `/api/auth/logout` を叩くものは、まず props で onClick を受け取る presentational に書き直してから吸収する。
- **'use client' の伝播**: hooks を使うコンポーネントはファイル先頭に `'use client'` を必ず明記する（barrel 経由でも安全）。
- **import 経路は @wanonwan/ui の公開 surface のみ**: apps から `packages/ui/core/...` の生パスへの直接 import は禁止。

## 判定フロー（吸収可否）

対象ファイルを開いたら、まずこの順で判定する。

```
1. fetch / next/navigation / next/headers / next/cookies / @/lib/* (app内部) を呼ぶ？
   ├─ Yes → 直接吸収は不可。次のいずれか:
   │   (a) presentational 部だけ切り出して吸収（app 側は wrapper を残す）
   │   (b) 吸収せず apps に残し、catalog 側の generic 部品と組み合わせる
   └─ No → 続行
2. app 固有の型 (@/lib/* の型) に依存？
   ├─ Yes → catalog 側に汎用型を定義し、props 経由で受け取る形に書き換えてから吸収
   └─ No → 続行
3. 単独ファイル吸収が妥当？ それとも slot 構造の大物にまとめる方が筋が良い？
   ├─ ナビ + ヘッダー + メインコンテンツのような構成 → templates/AppShell 等の
   │   slot 注入型を catalog に置き、app 固有部品は slot で渡す
   │   （個別吸収より良い設計になる）
   └─ 単独で完結する presentational → 通常の atoms/molecules/organisms として吸収
```

## パターン事例

### 事例1: ComingSoon — 単独吸収（成功例）

- 依存: Card / CardContent のみ（catalog 内）
- app 固有ロジック: なし
- 結果: `packages/ui/core/organisms/ComingSoon/` に配置、apps の 6 ルートで `@wanonwan/ui/organisms` 経由 import に変更
- PR: #27

### 事例2: AsyncActionButton — 単独吸収（成功例）

- 依存: Button のみ（catalog 内）
- app 固有ロジック: なし（fetch / router は呼び出し側で `onAction` に注入）
- 結果: `packages/ui/core/molecules/AsyncActionButton/` に配置、apps の 3 ファイルで `@wanonwan/ui/molecules` 経由 import に変更
- PR: #27

### 事例3: AppShell 配下 3 ファイル — slot 構造に統合（成功例、応用）

吸収を試みた:
- `Sidebar.tsx` — `usePathname` + 自前 `NavGroup` 型に依存
- `TopBar.tsx` — `LogoutButton` に内部依存
- `LogoutButton.tsx` — fetch(`/api/auth/logout`) + `useRouter` 依存

判定:
- LogoutButton は fetch + router → **吸収不可、apps 残置**
- Sidebar/TopBar は抽象化可能だが、3 個個別吸収より catalog の `templates/AppShell` を slot 注入型として採用するほうが筋が良い

採用した解:
- `templates/AppShell` を catalog から利用し、`<AppShell header={...} sidebar={...}>` の slot パターン
- apps/web 側は Sidebar/TopBar/LogoutButton を **そのまま app 層に残し**、AppShell の slot に渡す
- 結果として「個別吸収しない」が「より良い設計」になる

## 関連

- `/ui-apply` — 既存の catalog コンポーネントを apps の既存マークアップに適用する逆方向
- `packages/ui/package.json` の `exports` — catalog の公開 surface
- `outputs/plans/2026-05-19-1931-ui-catalog-bidirectional-sync.md` — Phase 0〜5 の計画
