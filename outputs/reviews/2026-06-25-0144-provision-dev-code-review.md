# Review: provision dev/stg/prod 対応（実装）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-25 01:44 JST |
| レビュアー | Claude Code（code-reviewer agent） |
| 対象 Plan | [`plans/2026-06-25-0101-provision-dev.md`](../plans/2026-06-25-0101-provision-dev.md) |
| ブランチ | `feature/provision-dev` |
| 関連 PR | TBD |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 |
|---|---|
| 最終判定 | **APPROVE** |
| Plan 判定 | N/A（[計画レビュー](2026-06-25-0130-provision-dev-review.md)済み） |
| 実装判定 | **APPROVE**（BLOCKER / CRITICAL / HIGH なし） |
| 記録整理 | OK |

## N-6（最重要）: stg/prod 引数の回帰 — なし

`flag()` 改修の挙動変化は「値が `--` 始まり or 末尾欠落なら undefined」のみ。`provision:stg`/`prod` の
固定引数はどの値も `--` 始まりでなく欠落もないため旧実装と同一結果。`isDev=false` で dev 分岐・B-2 ガードは
通らず stg/prod パス完全温存。`--email --code foo` 等の誤用が die になるのは改善（固定引数では発生しない）。

## 検証（実機・コード両面）

- [x] B-1: 単一 `let JWT_SECRET` を逆ガード(93)と mintServiceRoleToken(117) が共有。`DEV_JWT_SECRET` は
      compose `${JWT_SECRET:-dev-only-change-me-...}` と一致 → 素の dev で **login 200 / isAdmin:true**
- [x] B-2: `--dev` 無し dev compose → die / `--dev` + 非 dev compose → die / dev は network=waoon 強制
- [x] dev 逆ガード(dev値以外 die) ⇔ stg/prod 正ガード(dev値 die) の分岐
- [x] N-3: email/code を GoTrue 発行前に独立 die（既定 code=admin は seed と衝突 → 発行前中止）
- [x] SQL injection: 入力は `sqlStr` / `::uuid` 経由。秘密情報: PW は一度だけ表示、ハードコードは dev 既定値のみ
- [x] stg 回帰: env 必須のまま（.env.stg 欠損で exit 9）。turbo verify 10 green / prettier clean / node --check OK

## 指摘事項

| 重大度 | 指摘 | 対応 |
|---|---|---|
| LOW [NICE-TO-HAVE] | code 衝突 die メッセージに具体例があると親切 | **本レビューで反映済み**（`例: --code padmin`） |
| LOW [NICE-TO-HAVE] | dev で `process.env.JWT_SECRET` が本番風でも逆ガードで die（意図どおり） | 確認のみ・対応不要 |

## verdict

APPROVE
