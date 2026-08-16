# Hooks システム

本リポジトリは hook を **1 つも定義していない**。フォーマットと型チェックは
`turbo run lint typecheck` と CI が担保しており、hook で二重化していない。

## Hook 種別

- **PreToolUse**: ツール実行前（バリデーション、パラメータ修正）
- **PostToolUse**: ツール実行後（自動フォーマット、チェック）
- **Stop**: セッション終了時（最終確認）

## 導入するとき

`.claude/settings.json` の `hooks` に定義する。導入前に、
[plan-review-workflow.md](./plan-review-workflow.md) の Plan / Review 運用
（`outputs/plans/**` と `outputs/reviews/**` への書き込み）を止めないことを確認する。
`.md` の Write をブロックする類の hook は、この運用と衝突する。

## Auto-Accept Permissions

慎重に使う:
- 信頼できる、明確に定義された Plan では有効化
- 探索的な作業では無効化
- `dangerously-skip-permissions` フラグは **絶対に** 使わない
- 代わりに `.claude/settings.json` の `permissions.allow` に許可を積む。
  積むのは繰り返し使う恒常コマンドだけで、一回性のコマンドは残さない

## TodoWrite のベストプラクティス

TodoWrite ツールの用途:
- 複数ステップのタスクの進捗追跡
- 指示の理解確認
- リアルタイムでの軌道修正
- 詳細な実装ステップの可視化

Todo リストで見えてくるもの:
- 順序が間違ったステップ
- 抜け落ちた項目
- 余分な不要項目
- 粒度の誤り
- 指示の誤解
