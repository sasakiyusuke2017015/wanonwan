# Step 6: 最終設計（as-built）— この 1 枚が設計の一次

> 02〜05 は検討過程のスナップショット（履歴）。**決定の変遷で古くなった記述を含む**ため、
> 現行設計はこのファイルだけを正とする。変遷の理由は [index の決定ログ](index.md)（D6〜D12）。
> 検討過程で 02〜04 と本設計が食い違う点は V2/V3（[index](index.md) D13）として本ファイルへ集約済み。

## 全体像

```
Plan ヘッダ（構造化・一次）──生成──▶ outputs/README.md（生成物・手編集禁止）
  │
  ├ 概要        … ダッシュボード 1 行サマリの一次
  ├ ステータス   … 凡例 enum 1 個（rollup）の一次
  ├ 前提 Plan   … リンク
  ├ PR         … リンクのみ（状態・番号の実体は GitHub）
  └ Review     … リンクのみ（verdict の一次は Review ファイル）

Plan 本文 …… 目的 / スコープ / 現状（凍結印）/ 実装計画 / 検証 / リスク / 判断ログ(append-only)
Plan 末尾 …… ## ステータス チェックリスト（ヘッダ enum の詳細内訳）
Review  …… verdict とFindings の一次（テンプレ: reviews/_template.md）
```

## 原則（確定）

1. **不変な情報**（判断ログ・Goal・Scope・verdict）→ ファイル一次・複製自由。
2. **状態機械な情報**（フェーズ・PR 状態・指摘解決）→ 一次 1 つ + リンク。
   - フェーズの一次 = **Plan ヘッダの enum**（README はそこから生成）。
   - PR の状態・番号の実体 = GitHub（Plan はリンクを 1 回書くだけ）。
   - verdict の一次 = Review ファイル（Plan にはリンクのみ）。
3. **陳腐化する情報**（現状コンテキスト）→ 見出しに凍結印（YYYY-MM-DD 時点）。

## 02〜04 からの確定変更（供養）

| 旧設計 | 最終形 | 変えた理由 |
|---|---|---|
| 状態は末尾チェックリストのみ（02/03） | **ヘッダ enum が一次**、末尾は詳細内訳 | 末尾チェックリストは Plan ごとに不均一で、生成のソースにならない（D12） |
| README は Plan+GitHub から生成、slug で PR 突合（04） | **Plan ヘッダのみから生成** | PR↔Plan は curated（1 Plan 複数 PR・ブランチ名≠slug）で機械突合不能（D12） |
| 概要は README に手書き（旧運用） | **概要の一次は Plan ヘッダ** | README 生成の前提（D11） |

## 運用ルール（rules 反映事項）

- 新規 Plan は [`plans/_template.md`](../_template.md)、Review は [`reviews/_template.md`](../../reviews/_template.md) を使う。
- Plan の状態が変わったら **Plan ヘッダの enum を更新 → README を再生成**（手で README を書かない）。
- README 再生成: `node scripts/gen-outputs-readme.mjs`（ステップ4で配置）。
- 検証チェック（マージ後）は Plan 末尾チェックリストが一次のまま（GitHub に置き場が無い）。

## 移行の実績（M2 実行済み）

- 全 27 Plan: 概要欄注入（82bc5ad）→ ヘッダ正規化・enum 化（306d865）→ Review セルをリンクのみに（32d6f59）。
- 状態未設定 5 件の割当: turbo-monorepo / ui-eslint-setup / db-layer-to-packages / dev-gotrue-users-bootstrap = 🟢、provision-dev = 🟡（チェックリスト実績に基づく判断）。

## 残作業（このファイルのステータス）

- [x] テンプレ 2 枚（plans / reviews）
- [x] 全 27 Plan の正規化（概要・enum・リンクのみ）
- [x] README 生成器を `scripts/gen-outputs-readme.mjs` に配置し、README を生成物化
- [x] rules（`plan-review-workflow.md`）へ反映
- [ ] 現状コンテキストの凍結印（既存 Plan への遡及は任意・新規から徹底）
