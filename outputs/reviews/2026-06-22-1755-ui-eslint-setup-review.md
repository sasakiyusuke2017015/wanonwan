# Review: @ui-catalog/core eslint 整備

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-22 17:55 JST |
| レビュアー | Claude Code（+ code-reviewer agent） |
| 対象 Plan | [`plans/2026-06-22-1626-ui-eslint-setup.md`](../plans/2026-06-22-1626-ui-eslint-setup.md) |
| ブランチ | `feature/ui-eslint`（commit 2cb89e5） |
| 関連 PR | TBD |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER なし。lint/typecheck green、挙動不変 |
| Plan 判定 | N/A | 本 Review では Plan 妥当性は見ない |
| 実装判定 | **APPROVE** | 全変更が lint 違反解消の範囲。ランタイム挙動の変化なし |
| 記録整理 | OK | Plan と実装が整合。drift なし |

## 検証

- [x] `pnpm --filter @ui-catalog/core lint` green（38→0）
- [x] `pnpm --filter @ui-catalog/core typecheck` green
- [x] 編集 6 test ファイルで removed symbol の残存使用ゼロ（side-effect import 不含）
- [x] develop baseline とテスト結果差分ゼロ（2 failed / 28 passed の既存 failure のみ）
- [ ] CI green（PR 後に確認。ただし CI は ui の test/lint を未実行のため影響は限定的）

## 指摘事項

| 重大度 | ファイル:行 | 指摘 | 推奨修正 |
|---|---|---|---|
| LOW [NICE-TO-HAVE] | `core/organisms/AgendaView/AgendaView.tsx:135` | `event.icon as IconName` は任意 string を union 断定する型偽装が残る（`any` よりは改善。ランタイム挙動は PR 前と同一） | 後続で `CalendarEvent.icon?: IconName` に型を絞るか `Icon` 側で未知名を安全フォールバック |
| LOW [NICE-TO-HAVE] | `packages/ui/eslint.config.mjs` | `**/*.config.*` ignore により `eslint.config.mjs` 自身が lint 対象外 | 現状害なし。config 内コードが増えたら個別に lint 対象化を検討 |

## 実装レビュー

- **preserve-caught-error（Timeline / WeekView / EventModal 計 6 箇所）**: `throw new Error('...', { cause: error })` は適切。`${error}` を cause に移すことで Error チェーン（stack 含む）が保持され、デバッグ情報はむしろ改善。message 文言と throw する事実は不変。
- **no-useless-assignment（useCellStyles / useKeyboardNavigation）**: switch は `default` あり、if/else は末尾 `else` ありで全分岐代入を確認。use-before-assign / TDZ リスクなし。tsc green。
- **no-explicit-any（AgendaView）**: `any` → `IconName` で cast 先を狭めた。型偽装は残るが PR 前と挙動同一（上記 LOW）。
- **未使用 import 削除（test 6 件）**: 全て named import の未使用シンボル。side-effect import を巻き込んでいない。
- **MathView の require + disable**: optional peer dep の同期 require は ESM 動的 import に置換不可。Why コメント付きの inline disable は evergreen 準拠。空 catch にコメントを足し no-empty も解消。
- **MarkdownEditor の exhaustive-deps directive 削除**: plugin 未導入下では「rule not found」を生む dead directive。削除は正。意図コメントは保全。plugin 導入は別 Issue（Plan 判断ログ）。
- **eslint.config.mjs**: web を範とした最小構成（js.recommended + tseslint.recommended）+ `^_` 無視 + 消費側テンプレ除外。妥当。

## 運用 / インフラ影響

- CI: 現状 ui の lint/test は CI 未実行。本 PR は ui lint を機能させるが、CI への組込みは親 turbo Plan の担当（マージ後に `turbo run lint` へ）。本 PR 単体で CI 挙動は変わらない。
- migration / compose / env への影響なし。devDependency 追加（eslint 系 3 つ）と lockfile 更新のみ。

## フォローアップ

- [ ] AgendaView の icon 型を `IconName` に絞る（LOW）
- [ ] react-hooks plugin の本格導入（別 Issue。exhaustive-deps を ui 全体へ）
- [ ] ui unit test の安定化（既存 50 failed。CI 未組込み。別タスク）
- [ ] 親 [turbo Plan](../plans/2026-06-22-1447-turbo-monorepo.md) の `lint: turbo run lint` 化（本 PR マージ後）
