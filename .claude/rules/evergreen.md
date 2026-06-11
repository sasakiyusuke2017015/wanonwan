# Evergreen Rule

ドキュメントとソースコードは **"今このリポジトリで何ができるか" を現在形で書く** ことを唯一の目的とする。過去との差分・互換情報・一度きりの作業手順・歴史的経緯はリポジトリ本体には残さない。

履歴は **git log / PR / Plan ファイル** が持つ。リポジトリが二重持ちする必要はない。

## なぜ

- 時系列で肥大化すると、新規参加者が「今読むべき箇所」を見つけにくくなる
- 「旧 X」「新 Y」が並列で書かれると、どちらが現行か判断するコストが上がる
- 移行手順や互換コードは merge 後は無価値になる
- "evergreen" でない記述は、現行コード / docs が変わるたびに更新漏れを起こす

---

## ドキュメント編 (README / CONTRIBUTING / CLAUDE / docs/ / infra/README 等)

### 残さないもの

- **移行手順**（`旧 X から新 Y へ切り替えるには...`）
- **互換性のための回避策**（`旧 project name が残っている場合...`）
- **過去のリリースに関する注意**（`v1.2 以前は ... だった`）
- **一度きりのワンタイム作業**（`シードを再生成するには...`、運用担当のみ）
- **deprecated 警告のうち、削除済み機能**（削除と同時に説明も消す）
- **PR 番号 / コミット SHA への参照**（履歴で十分）

### 残すもの

- 現在の起動コマンド・URL・ポート・env
- 現在のディレクトリ構造とその役割
- 現在の PR フロー・コミット規約
- 現在のトラブルシュート手順（環境が壊れた時の **やり直し**）
- ライブな deprecated 警告（次のリリースで消える予定のもののみ、削除予定日とセットで）

---

## ソースコード編 (apps/ / packages/ / scripts/ など)

### 残さないもの

- **dead code**: 呼ばれていない関数・変数・import・branch
- **互換コード / 互換ブランチ**: `if (legacyMode)`, `v1Adapter`, deprecated path を別途残すラッパ。フラグが立たなくなったら削除
- **deprecated 関数 / API** のうち、削除予定日を過ぎたもの・呼び出し元が無いもの
- **歴史を語るコメント**: `// V1 では...`, `// 以前は X だったが...`, `// 2025-01 の変更で...`
- **PR 番号 / commit SHA への参照**: `// fixes #1234` のような単独参照（履歴に書く）
- **TODO のうち、誰も追わないもの**: 期限・担当が空欄の `// TODO`

### 残すもの

- 現在実行されているコード（dead code でない全て）
- **非自明な制約の "Why" コメント**: 隠れた不変条件、特定 bug の workaround、外部仕様の制約など、コードから読めない情報
- ライブな deprecated 警告（削除予定日とセット、`@deprecated since v2.3 — remove in v3.0`）
- active な feature flag（無効化された後すぐ削除）

### コメントの書き方

CLAUDE.md の "default to writing no comments" 原則と整合させる。

- コードが何をするか (`WHAT`) は識別子で語る → コメント不要
- なぜそうなっているか (`WHY`) が非自明なときだけコメント → 残してよい
- 当該タスク / PR / 過去のバグへの参照 (`for issue #123`, `added in v1.2`) → 残さない

---

## どこに何を書くか

| 種類 | 置き場所 |
|---|---|
| evergreen な手順・構成・現行 API | README / CONTRIBUTING / CLAUDE / docs/ / infra/README |
| evergreen なコード | `apps/` / `packages/` / `scripts/` |
| 1 回限りの作業（移行・cleanup） | **PR 本文** または **Plan ファイル** の判断ログ |
| 過去の意思決定の経緯 | Plan ファイル (`outputs/plans/`) |
| Breaking changes の周知 | **PR 本文の Breaking changes 節**（merge 後にコードからもドキュメントからも消す） |
| 削除予定機能の予告 | 該当箇所に短い `Deprecated: <削除予定日>` のみ |
| バグ修正の経緯 | コミットメッセージ / PR 本文（コード内コメントには書かない） |

---

## 運用ルール

1. **追加・編集時** に「これは今後も読まれる / 実行される情報か」を自問する。No なら PR 本文または Plan の判断ログに移す
2. **既存のものから古い記述を削除する** とき、削除自体を躊躇しない。履歴は git log に残る
3. **Breaking changes** はマージ時に Plan の判断ログと PR 本文に書いてから、本体は移行 *後* の現状だけを書く
4. **トラブルシュート節** に書くのは「**何かおかしくなった時のやり直し方**」であって「特定のバージョンから移行する方法」ではない
5. **deprecated を導入したら削除予定日も同時に決める**。期限のない deprecated は禁止
6. **dead code を見つけたら削除する**。「いつか使うかも」は禁止 — 必要になった時点で git log から拾える

---

## アンチパターン

### ドキュメント

```markdown
## 1.1 旧 dev compose からの移行（一度だけ）        ← Don't
以前 ... を起動していた場合は、新構成に切り替える前に古いスタックを止めてください
docker compose -p waoon down -v
```

→ migration 手順は PR 本文と Plan の判断ログに書き、ドキュメント本体は現状のみ:

```markdown
## トラブルシュート: 何かおかしくなった / 完全に作り直したい
pnpm compose:dev:down -v
pnpm compose:dev:up
```

### ソースコード

```ts
// V1 では camelCase だったが、v2 で snake_case に統一した        ← Don't
// (#1234 参照)
export function getUserProfile(id: string) { /* ... */ }

// legacy 互換用 wrapper. 2026-Q1 までに削除予定                  ← Don't (期限不明確 / 残り続ける)
export const getUserProfileCamel = getUserProfile
```

→ 経緯は PR 本文 / コミットログに、互換 wrapper は導入時点で削除予定日を決めて呼び出し元と一緒に消す:

```ts
export function getUserProfile(id: string) { /* ... */ }
```

```ts
// presigned URL を /api 経由ではなく直接ブラウザから叩く設計のため、    ← OK (非自明な制約)
// STORAGE_ENDPOINT は browser-reachable なホストである必要がある。
export const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT
```
