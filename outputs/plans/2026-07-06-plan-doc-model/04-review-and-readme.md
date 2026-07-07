> ⚠ **Superseded by [06-final-design](06-final-design.md)**。本ファイルの「Plan+GitHub から生成・slug で PR 突合」は
> 撤回（PR↔Plan は curated で機械突合不能と判明。最終形は Plan ヘッダのみから生成 = D12）。
> Review テンプレ節（4-1）は実物 [`reviews/_template.md`](../../reviews/_template.md) に反映済み。

# Step 4: Review テンプレ新設 + README ダッシュボード再定義

> [02-target](02-target.md) の原則を Review と README に適用する。実装（スクリプト・rules 反映）は Step 6。

## 4-1. Review テンプレ（`reviews/_template.md` 新設）

現行は Review テンプレが**欠落**していた。verdict をヘッダと末尾で2回書く重複もあった。
新版は **verdict の一次はヘッダ1箇所**、Plan 内容の再掲はしない。

```markdown
# Review: <タイトル>

| 項目 | 値 |
|---|---|
| 対象 Plan | <link> |
| 種別 | 計画レビュー / コードレビュー |
| 対象 | <commit or PR link> |
| レビュアー | <Codex / エージェント / 笹木さん> |
| verdict | **APPROVE / NEEDS WORK / BLOCKED**（★verdict の一次。1回だけ） |

## サマリ
<何をレビューしたか。1〜3 行。Plan 内容の再掲はしない>

## 判定スコープ
| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE / NEEDS WORK / BLOCKED |
| Plan 判定 | … / N/A |
| 実装判定 | … / N/A |
| 記録整理 | OK / FOLLOW-UP / N/A |

## Findings
### [BLOCKER] <...>
### [NICE-TO-HAVE] <...>
```

- 指摘の**解決状態**（状態機械）は、GitHub でレビューしたなら PR review が一次。
  Claude 完結レビューではこのファイルが記録（解決追跡は持たない、という限界を許容）。

## 4-2. README ダッシュボード = R1（生成）※実データで設計修正

> ⚠ **修正（2026-07-07）**: 実 README はリッチな**手書き概要列**を持つ（[01-current](01-current.md) F4）。
> 初版 4-2 はこの列を見落としていた。概要は編集的な**不変**情報なので GitHub からは生成できない。
> → **概要の一次を各 Plan に移し、README は Plan + GitHub から全生成する**（下記）。

**決定: README は手編集しない生成物。概要を含む全列を Plan + GitHub から生成する。**

### キモ: 概要の一次を Plan に置く

ダッシュボードの「概要」は編集的・不変の一文。これを各 Plan の **1 行サマリ欄**に置いて単一の一次とし、
README はそれを引く（README に概要を手書きしない＝ Plan↔README の二重を断つ）。
→ 新 Plan テンプレに「**ダッシュボード概要（1 行）**」欄を追加する（03 の改訂が要る）。

### データ源と生成列

- **Plan ファイル群** `outputs/plans/*.md`: 1 行概要 / Review リンク / 末尾チェックリスト（→フェーズ）
- **GitHub** `gh pr list --json number,state,headRefName,title`: PR 状態・番号
- **Plan ↔ PR の結合キー**: **slug**（ファイル名 slug ＝ `feature/<slug>` 突合。補助で Plan の PR 欄）
- **生成列**: Plan（リンク）/ フェーズ（下記導出）/ 概要（Plan の 1 行サマリ）/ PR（リンク）/ Review（リンク）
- **フェーズの導出**（状態機械を GitHub + チェックリストから導く。手書きしない）:

  | 条件 | 表示フェーズ |
  |---|---|
  | slug に対応する PR が無い | 計画中 / 実装中（Plan チェックリストの到達点で分岐） |
  | PR が open | レビュー / マージ承認待ち |
  | PR が merged かつ Plan の検証チェック未完 | マージ済み（検証中） |
  | PR が merged かつ 検証チェック完了 | 完了 |

- **生成物の明示**: README 冒頭に `<!-- 自動生成。手編集しない。生成: pnpm <script> -->`。
- **生成トリガ**（Step 6 で確定）: 手動スクリプト or CI（PR merge 時に再生成）。

### これで解消される現状課題（検証済みに限定）

- **状態機械（フェーズ・PR）の手書き複製をやめる** → drift の構造的危険を除去（検証済み実例は無かったが、
  重複そのものは実在。将来の drift 源を断つ）。
- **概要の Plan↔README 二重**も、一次を Plan に一本化して解消。

## 未決（Step 5–6 へ）

- 生成スクリプトの実装技術（node / gh / CI 配線）＝ Step 6。
- 既存 12 Plan を新テンプレへ移行するか＝ Step 5。
- `plan-review-workflow.md` の「README は手書き更新」記述を「生成物」に書き換え＝ Step 6。

## 確認事項

1. Review テンプレ（verdict 一次1箇所・Plan 再掲なし）でよいか
2. README 生成の**結合キーを slug（`feature/<slug>` 突合）**にする設計でよいか
3. フェーズ導出表（PR 無/open/merged×検証）でフェーズ分類は足りるか
