# Review: AppShell / Sidebar 導入 Phase A — カタログ同期（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-23 15:05 JST |
| レビュアー | Claude Code（code-reviewer サブエージェント） |
| 対象 Plan | [`plans/2026-07-23-1357-appshell-sidebar-adoption.md`](../plans/2026-07-23-1357-appshell-sidebar-adoption.md) |
| 対象 | ブランチ `feature/ui-catalog-sync-2` の未 commit 差分 |
| ブランチ | `feature/ui-catalog-sync-2` |
| 関連 PR | TBD |
| レビュー種別 | 実装（Phase A・カタログ同期） |
| verdict | **APPROVE** |

## サマリ

`packages/ui` に限定した Phase A の差分（上流 16 ファイル置換 / 衝突 13 ファイルのマージ /
AppShell・SidebarShell・SidebarAccountMenu・SegmentedRatioBar・hexColor の新規採用 /
registry・subpath export 更新 / DataTable テスト絞り込みの修正）を実 diff とテスト実行で検証した。
BLOCKER はゼロ。Plan の核心的な決定（`--topbar-h` のスコープ限定、DataTable の waoon 版統一）は
いずれも意図どおり実装されている。指摘 6 件はすべて `[NICE-TO-HAVE]` で、うち 5 件は反映済み。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE |
| Plan 判定 | N/A（計画レビュー 3 回目で APPROVE 済み） |
| 実装判定 | APPROVE |
| 記録整理 | FOLLOW-UP → 対応済み |

## 検証したこと

| 観点 | 方法 | 結果 |
|---|---|---|
| `--topbar-h` の非漏出 | `apps/web` / `packages/ui/core` を grep | 参照は `DataTable.module.scss:37,391` と `SidebarShell.tsx:74` のみ。定義は `[data-sidebar-state]` に閉じており、`AppShellRoot` を持たない現行 apps/web では未定義のまま = 現行 sticky 挙動を維持 |
| DataTable サブシステムの一貫性 | `git status --short` | 変更は `DataTable.test.tsx` のみ。実装 7 ファイルは HEAD のままで waoon 版に統一されている |
| registry / versions.json 整合 | キー列を抽出して比較 | 140 / 140、**順序を含めて完全一致**。重複キーなし |
| subpath export の実在 | `catalog-integrity.test.ts` | 2 passed |
| 見送り部品への残参照 | 6 部品名を全 ts/tsx/json/scss で grep | 実コード参照ゼロ（JSDoc 内の言及のみで import なし） |
| barrel の export 漏れ | 4 本の barrel の diff | 新規 4 部品 + hexColor がすべて追加済み。旧 `export { AppShell }` は Provider/Root/sidebarState に置換済み |
| テスト | 対象 8 ファイルで vitest | 181 tests all passed |
| 改行コード | 変更ファイル全件を CR 有無で判定 | CRLF だった 3 ファイルは CRLF のまま、他は LF。新規ファイルは全 LF。改行差し替えによるノイズ diff なし |

## Findings

### [BLOCKER]

なし。

### [NICE-TO-HAVE] catalog docs に削除済み `AppShell` の import 例が残る

`packages/ui/README.md:61` / `packages/ui/docs/ARCHITECTURE.md:261` が、存在しない
`import { AppShell } from '@ui-catalog/core/templates'` を例示している。
→ **反映済み**: 新 API（`AppShellProvider` / `AppShellRoot` を subpath から import）へ差し替え。

### [NICE-TO-HAVE] `sidebar_state` cookie に `Secure` が無い

`AppShellProvider.tsx` の cookie 書き込みは `path` / `max-age` / `samesite=lax` は妥当だが
`Secure` が無い。値は UI 設定のみで機微情報ではないが、cookie ポリシーとして揃える方がよい。
なお `cookieName` / 値ともに app 制御の定数・union 型でインジェクション経路は無く、
`parseSidebarState` が `'collapsed'` 完全一致以外を `expanded` に落とすため改竄耐性はある。
→ **反映済み**: `location.protocol === 'https:'` のときだけ `secure` を付与（localhost の dev で
cookie が書けなくなるのを避けるため）。

### [NICE-TO-HAVE] `hexReadableTextColor` が不正入力を黙って通す

`'blue'` 等を渡すと `parseInt` が `NaN` → 比較が常に false → 白字に倒れる。唯一の呼び出し元
`Badge.tsx` は `isHexColor()` で守っているため実害は無いが、公開 util として前提が型に現れていない。
→ **反映済み**: 先頭で `isHexColor()` を通し、非 hex は `#1f2937` へ明示フォールバック。

### [NICE-TO-HAVE] SidebarShell の story が waoon に存在しないアイコン名を使う

`layout-dashboard` / `file-check` が waoon の `ICON_PATHS` / `LUCIDE_ICONS` のいずれにも無く、
Storybook 上でアイコンだけが消える（ユニットテストは独自 `resolveIcon` を使うので影響しない）。
→ **反映済み**: `dashboard` / `clipboard-check` へ差し替え。story 内の全アイコン名が解決することを確認。

### [NICE-TO-HAVE] `Badge` の `logoSrc` に読み込み失敗時の扱いが無い

URL 切れ / 403 で壊れ画像アイコンが残る。`hexColor` 側は無効値をフォールバックするのに対して
非対称。`<img src>` に `javascript:` は実行されず、値は admin 管理のマスタ入力なので現時点で脅威は無い。
→ **未反映**（上流実装をそのまま維持。必要になった時点で `onError` / `referrerPolicy` を検討）。

### [NICE-TO-HAVE] `menuCrossOffset` のマジックナンバー

`SidebarAccountMenu.tsx` の `collapsed ? 21 : 80` は導出根拠がコメントで説明されているが、
`--sidebar-w-expanded` / `--sidebar-w-collapsed` を変えると静かに崩れる。
→ **Plan の残課題へ記載**（Phase B で sidebar 幅を触る場合の追随対象）。

## テスト修正の妥当性

`DataTable.test.tsx:266,294` の `closest('[role="columnheader"]')` → `closest('th')` は
**テストを甘くしていない。むしろ厳密化している**。

- DataTable の実装は `<th>` に明示 `role="columnheader"` を付けておらず、属性セレクタは
  暗黙ロールにマッチしない。したがって旧コードでは述語が常に `true` を返し、`.find()` は実質
  「DOM 上で最初に見つかった `氏名`」を拾っていた
- 上流 DropdownMenu が menu を `document.body` へ portal するようになり、ヘッダとピッカーの
  DOM 順序が入れ替わったため、依存していた前提が壊れた
- `closest('th')` はヘッダセルを構造として正しく判定するため、テストの意図（「ピッカー行の方の
  ラベルを取る」）が初めて実際に検査されるようになった。同ファイルの
  `getByRole('columnheader', ...)` は Testing Library が暗黙ロールを解決するため変更不要

## 良かった点

- `tokens.css` の `[data-sidebar-state]` スコープ化に、なぜ `:root` ではないかの Why コメントが
  併記されている。Phase B で誰かが `:root` に戻す事故を防げる
- `@theme inline` で raw 値を `:root` 側に置き utility を `var()` 参照にしているため、
  Phase B のテーマ 3 軸ブリッジ（要素単位の上書き）が素直に効く形になっている
- `DropdownMenu` の portal 化にあたり、外側クリック判定へ `menuRef` 経路を足している。
  portal 化に伴う「メニュー内クリックが外側扱いになる」退行を上流ごと正しく取り込めている
- `catalog-integrity.test.ts` が subpath export の実在と versions.json の同期を機械検査しており、
  今回の 5 本の subpath 追加が手動確認に頼らず担保されている

## 残課題（Phase B へ引き継ぎ）

- `AppShellRoot` の `bg-background` は waoon に `--color-background` が無く utility が生成されない
  （Plan の残課題に既記載）
- `SidebarShell` の brand 行は `h-[var(--topbar-h)]` を使うため、Phase B で必ず `AppShellRoot`
  配下に置くこと（外に出すと高さが auto に落ちる）
- `SidebarAccountMenu` の `menuCrossOffset` は sidebar 幅トークンに追随が必要
