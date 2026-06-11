# Hooks システム

## Hook 種別

- **PreToolUse**: ツール実行前（バリデーション、パラメータ修正）
- **PostToolUse**: ツール実行後（自動フォーマット、チェック）
- **Stop**: セッション終了時（最終確認）

## 現状の Hooks（`~/.claude/settings.json` に定義）

### PreToolUse
- **tmux リマインダー**: 長時間コマンド (npm, pnpm, yarn, cargo 等) で tmux を推奨
- **git push レビュー**: push 前に Zed を開いてレビュー
- **doc ブロッカー**: 不要な .md / .txt ファイル作成をブロック

### PostToolUse
- **PR 作成**: PR URL と GitHub Actions ステータスをログ
- **Prettier**: JS / TS ファイル編集後に自動フォーマット
- **TypeScript チェック**: .ts / .tsx ファイル編集後に tsc 実行
- **console.log 警告**: 編集ファイル内の console.log を警告

### Stop
- **console.log 監査**: セッション終了前に編集ファイル全てを console.log でチェック

## Auto-Accept Permissions

慎重に使う:
- 信頼できる、明確に定義された Plan では有効化
- 探索的な作業では無効化
- `dangerously-skip-permissions` フラグは **絶対に** 使わない
- 代わりに `~/.claude.json` の `allowedTools` を設定する

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
