# Plan: @ui-catalog/core に eslint を整備し lint を機能させる

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-22 16:26 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | `feature/ui-eslint` |
| 関連 PR | TBD |
| レビュー | TBD |
| 親 Plan | [2026-06-22-1447-turbo-monorepo.md](2026-06-22-1447-turbo-monorepo.md)（turbo の lint 拡大の前提） |

## 目的

`packages/ui`（`@ui-catalog/core`）の `lint` script は `eslint . --ext .ts,.tsx` だが、
**eslint 依存も設定ファイルも無く実行不能な dead script** だった（[turbo Plan Phase 0](2026-06-22-1447-turbo-monorepo.md) で発覚）。
ui に eslint（web と同じ flat config: eslint 10 / typescript-eslint 8）を導入し、lint を実際に
機能させる。これは親 turbo Plan が lint を `turbo run lint` に拡大するための前提。

## スコープ

### やること
- ui に eslint / @eslint/js / typescript-eslint を devDependency 追加
- `packages/ui/eslint.config.mjs`（flat config）を新規作成
- ui の `lint` script を flat config 用に修正（`eslint .`）
- `eslint .` で出る違反 38 件を解消し、`pnpm --filter @ui-catalog/core lint` を green にする
- 消費側テンプレ `infra/eslint/parent-strict.cjs` は ui ソースではないため lint 対象外（ignores）

### やらないこと
- web 側の eslint 設定変更（無関係）
- turbo 導入 / root scripts 変更 / CI 変更（親 turbo Plan の担当）
- ui の dependency-direction ルール（atoms→molecules 禁止等）の新規導入（parent-strict.cjs に
  「後日」と明記されている範囲。本 Plan では入れない）

## 現状コンテキスト

- web は eslint flat config 完備（[apps/web/eslint.config.mjs](../../apps/web/eslint.config.mjs)、
  eslint ^10.5.0 / @eslint/js ^10.0.1 / typescript-eslint ^8.61.1）。これを範とする。
- `parent-strict.cjs` は **複製先プロジェクト用の eslintrc テンプレート**。ui 自身は使わない。
- 違反 38 件のルール別内訳（`eslint .` 実測）:

| ルール | 件数 | 対処 |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | 22 | 未使用 import/変数の削除（test/stories 中心） |
| `preserve-caught-error` | 6 | `throw new Error(msg)` → `throw new Error(msg, { cause: error })`（Timeline / WeekView） |
| `@typescript-eslint/no-unused-expressions` | 3 | 該当式の修正 |
| `no-useless-assignment` | 2 | 無駄な代入の削除 |
| `react-hooks/exhaustive-deps` | 1 | MarkdownEditor の inline disable directive が未導入 plugin を参照 → directive 削除（plugin は本 Plan では入れない。→ 判断ログ） |
| `no-undef`(`module`) | 1 | parent-strict.cjs を ignores へ（config テンプレ） |
| `no-empty` / `no-require-imports` / `no-explicit-any` | 各 1 | 個別修正 |

## 実装計画

1. eslint 依存追加（済）・`eslint.config.mjs` 作成（済）・lint script 修正（済）。
2. config の `ignores` に `infra/eslint/**`（消費側テンプレ）を追加し `no-undef` を解消。
3. `preserve-caught-error` 6 件を `{ cause: error }` 付与で解消（Timeline / WeekView の throw）。
4. `react-hooks/exhaustive-deps` の stale な inline disable directive を削除（plugin 未導入のため
   directive 自体が「rule not found」を誘発）。
5. `no-unused-vars` ほか軽微な違反を順次解消。
6. `pnpm --filter @ui-catalog/core lint` が green になるまで反復。
7. `pnpm --filter @ui-catalog/core typecheck` / `test` が壊れていないことを確認。

## 検証
- [x] `pnpm --filter @ui-catalog/core lint` が exit 0（38→0）
- [x] `pnpm --filter @ui-catalog/core typecheck` が green（lint 修正でデグレなし）
- [x] 編集した test/source が既存テストを壊していない: 編集 6 test ファイルで removed symbol の
      ReferenceError なし。develop baseline と同一結果（2 failed / 28 passed）で **差分ゼロ**
- [x] Timeline / WeekView / EventModal の throw 修正は message 維持 + `{ cause }` 付与のみ（throw する事実は不変）

### スコープ外の既知事項
- ui の unit test 全体は **50 failed / 534 passed**（既存。CI に ui の `test` script が無く未実行）。
  本 PR の変更とは無関係（baseline で確認済み）。ui test の安定化は別タスク。

## リスク
| リスク | 影響 | 緩和 |
|---|---|---|
| 未使用 import 削除で副作用（side-effect import）を消す | ランタイム破壊 | 純粋な未使用シンボルのみ削除。side-effect import は残す |
| `preserve-caught-error` 修正で挙動変化 | 例外伝播の差異 | message は維持し `{ cause }` のみ追加（throw する事実は不変） |
| react-hooks directive 削除で将来 deps 検査が緩む | hooks バグ検出漏れ | plugin 本格導入は別 Issue。今は dead directive 除去のみ |

## 判断ログ
| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-06-22 | ui eslint 整備を親 turbo Plan から分離し独立 PR にする | 38 件の修正（一部コンポーネント本体）は turbo 導入と関心が異なる。1 タスク=1 PR でレビュー容易性を保つ。turbo の lint 拡大は本 PR マージ後に行う |
| 2026-06-22 | react-hooks plugin は導入せず、stale な disable directive を削除する | plugin 導入は exhaustive-deps を全 ui に課し違反が増殖しうる。本 Plan の目的（lint を green に）を超えるため別 Issue。今は「rule not found」を生む dead directive のみ除去 |
| 2026-06-22 | dependency-direction 等の ui-catalog 独自ルールは入れない | parent-strict.cjs にも「後日」とある範囲。flat config は js.recommended + tseslint.recommended の最小から始める |

## ステータス
- [ ] 計画レビュー（`/plan-review`）
- [ ] Plan 承認（笹木さん）
- [ ] 実装
- [ ] コードレビュー（`/pr-review`）
- [ ] PR merge
- [ ] マージ後検証（上記「検証」チェック）
