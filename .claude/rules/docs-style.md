---
paths:
  - "**/*.md"
  - "CLAUDE.md"
---

# ドキュメント記述スタイル

CLAUDE.md / docs / README / outputs (Plan/Review) など、**人間が読む `.md` を書く / 編集するとき** に守る作法。コード内コメントには適用しない (コメント方針は [`evergreen.md`](./evergreen.md) と CLAUDE.md「Doing tasks」を参照)。

## 1. 環境前提を意識する (Windows + PowerShell 5.1)

笹木さんの主環境は **Windows + PowerShell 5.1 + Rancher Desktop**。`docs/CONTRIBUTING.md §0` で明示されている通り、Windows がプロジェクトの **第一級の開発環境**。Linux (stg server) / macOS は補助的。

このため、ドキュメント中のコマンド例には以下を守る:

### bash 専用構文を避ける

- ❌ `pnpm clean && pnpm install && pnpm compose:dev:up`
  - **PowerShell 5.1 では `&&` がトークン解釈されず "InvalidEndOfLine" エラー**
- ✅ 1 コマンド/行に分けて書く:
  ```bash
  pnpm clean
  pnpm install
  pnpm compose:dev:up
  ```
- ✅ または表セルなど 1 行で書く必要がある場合は、表外に「PowerShell 5.1 では `&&` が使えないため 1 コマンドずつ実行してください」と注記する

### Shell の glob 展開に依存しない (package.json scripts)

`package.json` の `scripts` に書くコマンドは **POSIX shell の glob 展開を前提にしない**。bash/zsh は `apps/*/node_modules` を呼び出し前に展開するが、PowerShell は展開しない (文字列のまま渡る) ため、Windows で `EINVAL: Illegal characters in path` で落ちる (`*` が Windows のファイル名で不正文字)。

ツール側の glob 機能を使うか、リテラル列挙する:

- ❌ `rimraf node_modules apps/*/node_modules packages/*/node_modules`
  - bash で動くが PowerShell で死ぬ
- ✅ `rimraf -g node_modules "apps/*/node_modules" "packages/*/node_modules"`
  - `-g` で rimraf 内蔵 glob を有効化 (v6 デフォルトは `--no-glob`)、クオートで shell 展開を抑止
- ✅ または列挙: `rimraf node_modules apps/web/node_modules packages/ui/node_modules packages/db/node_modules packages/storage/node_modules`
  - workspace 追加時に PR で気付けるメリットあり (clean:build はこちらを採用)

ツールごとの glob 対応:

| ツール | デフォルト | 有効化方法 |
|---|---|---|
| `rimraf` v6 | `--no-glob` | `-g` または `--glob` |
| `del-cli` | ON | (デフォルト) |
| `globby` (programmatic) | ON | (デフォルト) |
| `npm-run-all` の `run-p` | shell 経由なので shell 依存 | shell 側で展開 = NG |

その他、Windows で挙動が異なる代表的な要素:

| bash / POSIX | Windows (PowerShell 5.1) |
|---|---|
| `&&` (AND chain) | `; if ($?) { ... }` または 1 コマンド/行 |
| `||` (OR chain) | `; if (-not $?) { ... }` |
| `rm -rf` | `Remove-Item -Recurse -Force` (cross-platform にしたいなら `rimraf` を pnpm script に包む) |
| `export FOO=bar` | `$env:FOO = "bar"` (1 回限り) |
| バックスラッシュ continuation `\` | バッククォート `` ` `` (PowerShell の場合) |
| パス区切り `/` | Windows でも `/` で大抵動くが、cmd / Win32 API は `\` を要求するケースあり |
| heredoc `<<EOF` | PowerShell の `@" ... "@` |

### コードフェンスの言語タグ

コマンドが Windows / Linux 両対応のときは ```bash か ```powershell を使い分けると IDE のシンタックスハイライトが意図を伝える。**Linux 限定** (Docker exec / stg server SSH 内など) のコマンドはその旨を地の文で明示。

## 2. ファイル参照は markdown link で

CLAUDE.md, docs, Plan, Review 等を読み手 (人間 / Claude Code 両方) が辿りやすくするため、ファイル参照は **markdown link 形式**で書く:

- ✅ [`docs/CONTRIBUTING.md`](../../docs/CONTRIBUTING.md)
- ✅ [package.json:14-32](../../package.json#L14-L32)
- ❌ `docs/CONTRIBUTING.md` (バッククォートでファイル名だけ書くだけだと、IDE 上でクリックして開けない)

VSCode 拡張で動かしているときは相対パスのリンクが効くため、`../../` の起点ずれに注意。

## 3. evergreen と整合させる

[`evergreen.md`](./evergreen.md) のとおり「現在形で書く」「移行手順 / 互換コメント / 過去経緯は本体に残さない」。docs-style はその上に乗る:

- **環境互換性**: ある時点で「今は Windows + PowerShell 5.1」と固定的な事実として書く。将来 PowerShell 7+ に上げたら本ルールを更新する (移行手順ではなく現状を書く)
- **コマンド表記**: 過去の表記との差分は書かない (`git log` で十分)

## 4. 表セル内の改行制約

Markdown 表のセル内では `\n` で改行できない (HTML `<br>` は使えるが読みにくい)。複数行コマンドが必要なら:

- 表セル: 単一コマンドだけ
- 複数ステップが必要なら表外にコードフェンスで書き、表セルからリンクする
- または `pnpm clean && pnpm install && pnpm compose:dev:up` のように `&&` で連結 + 表外で Windows 注記を添える

## 5. CLAUDE.md 本体は 200 行以下を維持

CLAUDE.md は **毎セッション無条件投入** されるため、詳細は CONTRIBUTING / docs 側に集約し、CLAUDE.md には要約 + リンクのみ残す。

200 行を超えそうなときは:

- 該当節を `docs/` 配下の専用 md に分離 (例: `docs/logging.md`)
- CLAUDE.md には 2-3 行のサマリ + リンクだけ残す
