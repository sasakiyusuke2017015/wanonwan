# Review: ダークモード（semantic トークン反転 + colorScheme 軸）— 計画レビュー

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-08-14 00:43 JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/2026-08-14-0025-dark-mode.md`](../plans/2026-08-14-0025-dark-mode.md) |
| ブランチ | `develop`（`cca24bc`） |
| 関連 PR | なし（Plan のみ） |
| レビュー種別 | 計画 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE | 初回 HIGH 2 件 / MEDIUM 2 件を Plan へ反映済み |
| Plan 判定 | APPROVE | 反転境界の設計は妥当。「light 不変」の扱いを現実的な運用へ修正した |
| 実装判定 | N/A | 未実装 |
| 記録整理 | OK | 親 Plan の判断ログ・ステータスへ反映済み |

> 初回判定は `NEEDS WORK`。下表の指摘を Plan に反映した後の再判定として `APPROVE`。

## 指摘事項

| 重大度 | 箇所 | 指摘 | 対応 |
|---|---|---|---|
| HIGH [BLOCKER] | 3e / 検証 | **「semantic トークンへ repoint」と「light の見た目が不変」は、そのままでは両立しない**。143 箇所の内訳を実測すると gray は 4 段階（`text-gray-400` 14 / `-500` 26 / `-600` 8 / `-700` 4）使われている一方、受け皿の text 系 semantic トークンは `--color-text` / `-primary` / `-secondary` / `-muted` / `-inverse` の 5 個。**4 段階を 2〜3 トークンへ畳むと light の描画が変わる**。Plan は「差分ゼロで機械的に担保」と書いていたが、実際には VRT が正当な変更も差分として出す | 検証基準を「差分ゼロ」から **「差分を 1 件ずつ〈意図した統合〉と〈事故〉に仕分ける」** へ修正。3e の前段に「143 箇所 → トークンの対応表を作り、畳む段階を先に決める」ステップを追加 |
| HIGH [BLOCKER] | 3a の検証 | **3a 単独 PR の検証基準「catalog が反転すること」が達成不能**。catalog の色は System A（`design.ts` の HSL 生成 → inline style）でも塗られており、semantic トークンの上書きだけでは inline 部分は反転しない。基準のまま進めると「反転しないので設計が間違っている」と誤判断しかねない | 3a の検証基準を **「semantic トークンを参照している部品が反転し、inline style 由来の色は 3d まで据え置きであることを確認する」** に限定。両者の境界を目視で切り分ける手順に修正 |
| MEDIUM [NICE-TO-HAVE] | 3e | `text-blue-600`（8 箇所・リンク色）を `--color-primary` へ repoint すると、**6 色テーマの選択に応じてリンク色が変わる**。ダーク対応とは別の挙動変更が混入する | 対応表作成時に「テーマ追従させるもの／固定色のまま semantic 化するもの」を分類する方針を追記 |
| MEDIUM [NICE-TO-HAVE] | リスク | `prefers-color-scheme` デッドコードの扱いが「削除する **or** import しない状態を維持」の両論併記で、決めていない | 3a で **削除する**（二重制御の芽を残さない）と確定 |
| LOW [NICE-TO-HAVE] | 未確定事項 | FOUC 対策と a11y 目標が「提案」のまま | 本レビューで **提案どおり確定**（pre-paint inline script を入れる / AA 全面準拠は別 Plan）。判断ログへ移動 |

## 計画レビュー

- **反転境界の設計**: semantic トークン層（System B）に引く三層モデルは、色が inline style で塗られている現状に対して妥当。System A を前景のみ調整しブランド色相を保持する方針も、親 Plan の非目標（HSL 生成の作り直しをしない）と整合している。
- **トークンの実在確認**: Plan が名指しする 4 系統は実在する（`--color-surface*` 2 / `--color-text*` 5 / `--color-border*` 5 / `--color-bg*` 6）。3a の前提は成立する。
- **段階分割**: 3a を単独 PR にして反転境界を先に検証する判断は、143 箇所を触った後の手戻りを避ける設計として正しい。3b（body 地色）を 143 の前に置く順序も妥当。
- **背景 9 軸との直交**: ユーザーの背景選択を保持する判断は妥当。組合せ 18 通りに対し「代表 3 背景 × dark」で目視を絞る根拠（反転が semantic トークン層で一元化されている）も示されている。
- **依存関係**: VRT がブロック中でも 3e を進められるよう、手動 before/after 比較のフォールバックが用意されている。ただし HIGH #1 のとおり、その比較の**合否基準**が甘かった。

## 検証

- [x] 143 箇所の内訳をクラス別に実測（gray 4 段階 / `text-red-600` 23 / `bg-white` 8 / `border-gray-*` 13 / `text-blue-600` 8）
- [x] `tokens.css` に text / surface / border / bg の semantic トークンが実在することを確認
- [x] `data-theme-mode` / `@custom-variant` / `colorScheme` がソース全体でゼロヒットであることを確認
- [x] Plan 内の相対リンク・参照先ソースファイルの実在
- [ ] 3a 単独 PR で semantic トークン経由の部品が反転すること（実装時）

## フォローアップ

- [ ] WCAG AA の網羅監査は別 Plan（本 Plan の残課題に記載済み）
- [ ] 4-dark（ダーク撮影の VRT 追加）は [VRT Plan](../plans/2026-08-14-0020-vrt.md) 完了後
