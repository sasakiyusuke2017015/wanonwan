# Plan Review: turbo (Turborepo) 導入 + scripts ergonomics 整理

| 項目 | 内容 |
|---|---|
| 対象 Plan | [2026-06-22-1447-turbo-monorepo.md](../plans/2026-06-22-1447-turbo-monorepo.md) |
| 種別 | 計画レビュー（実装前） |
| レビュー日時 | 2026-06-22 15:58 JST |
| レビュー方針 | `[BLOCKER]` / `[NICE-TO-HAVE]`。BLOCKER がなければ APPROVE |

## 判定

| scope | verdict | メモ |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER なし。turbo 導入・既存 script 維持・Dockerfile 非変更の切り方はいずれも妥当 |
| Plan 判定 | **APPROVE** | 実装着手可能。NICE-TO-HAVE は Plan 追記すると実装時の迷いが減るが、差し戻し理由ではない |
| 実装判定 | N/A | 本 Review は計画のみ |
| 記録整理 | FOLLOW-UP | root `test` の意味、typecheck 依存定義の意図、root alias 検証を Plan に軽く追記するとよい |

## 総評

スコープは妥当。特に `dev:up` / `compose:dev:*` / `test:db` など doc 参照が多い既存 script をリネームせず、ergonomics を clean 系の追加に留める判断は安全側に倒せている。Dockerfile.web を `pnpm --filter @waoon/web build` のまま維持する方針も、CD 経路を変えないという目的と整合している。

CI を `pnpm turbo run typecheck lint build test` に集約しつつ、DB image build / compose up / migrate / seed / pgTAP / down を turbo 外に残す構成にも穴は見当たらない。root `test` は unit test の集約で、DB/pgTAP は引き続き `test:db` という分離が保たれている。

## 指摘

### [BLOCKER]

なし。

### [NICE-TO-HAVE] N-1: `typecheck` の `dependsOn` は意図を明記するか `^typecheck` を検討する

Plan の `turbo.json` 案では `typecheck: { "dependsOn": ["^build"] }` になっている。一方、現状の workspace 依存先である `@waoon/auth` / `@waoon/domain` / `@ui-catalog/core` は `build` script を持たず、`typecheck` script を持つ。つまり `typecheck` については「依存パッケージの typecheck を先に通す」という順序は明示されない。

全 package の `typecheck` 自体は `turbo run typecheck` で実行されるため、即時の品質ゲート欠落ではない。ただし Plan の目的に「依存グラフ順の実行明示」が含まれるなら、以下のどちらかを Plan に明記すると実装時に迷わない。

- `typecheck: { "dependsOn": ["^typecheck"] }` にして、依存先の型チェック完了後に依存元を型チェックする。
- あえて `^build` のみとするなら、waoon の package は source export 前提なので順序保証より全体実行を重視する、と理由を書く。

### [NICE-TO-HAVE] N-2: 検証項目に root alias の確認を追加するとよい

検証は `pnpm turbo run typecheck lint build test` を中心に書かれているが、実際に開発者と CI が触る ergonomics は root script の `pnpm typecheck` / `pnpm lint` / `pnpm build` / `pnpm test`。Plan の目的が操作体系の統一なので、以下も検証チェックに入れると「マージ後に日常コマンドが OK」と言いやすい。

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm test`

特に `pnpm test` は root に新設されるため、直接確認対象に含める価値がある。

### [NICE-TO-HAVE] N-3: `lint` / `test` 拡大のリスク評価は妥当だが、docs 更新対象を少し具体化するとよい

`lint`: web のみから web + ui、`test`: root 未定義から web + worker へ広がる、というリスク整理は現状 script と一致している。CI では worker test が既に走っているため、`test` の CI リスクは重複解消寄りで妥当。

ただし [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) のテスト表は現状 `pnpm --filter @waoon/web test` を案内している。root `pnpm test` を新設するなら、docs 反映 Phase で CONTRIBUTING の「テスト・チェック」表を最小更新対象として明記すると、操作体系統一の目的と揃う。

### [NICE-TO-HAVE] N-4: 判断ログに「root `test` は DB/pgTAP を含まない」を残すとよい

CI では DB/pgTAP を残す計画になっており、構成としては問題ない。ただ、root `test` が新設されると「`pnpm test` で全テストか？」という解釈が生まれやすい。

判断ログに「root `test` は web + worker の Vitest 集約に留め、DB/pgTAP は起動前提が異なるため `test:db` として分離維持」と残すと、後続の doc / CI 整理でぶれにくい。

### [NICE-TO-HAVE] N-5: clean 系の列挙対象は実装時に `packages/ui` の実態へ合わせる

Plan の `clean:build` 例に `packages/ui/dist` があるが、現状 `packages/ui` は `build` script を持たず、主な生成物は `storybook-static` や cache 系。`dist` を列挙しても害は薄いが、clean の目的を「build 成果物」に寄せるなら、実装時に `packages/ui` の現行 script と生成物を見て、`storybook-static` を `clean:build` に含めるか、storybook 系は package 側 `clean` に任せるかを決めるとよい。

## 観点別確認

| 観点 | 確認結果 |
|---|---|
| スコープ | 妥当。既存 script 非リネーム、Dockerfile 非変更、Remote Cache スコープ外はいずれも Plan 目的と整合 |
| `turbo.json` tasks | `build` outputs は Next.js `.next` と汎用 `dist` を押さえている。`typecheck` の依存定義だけ意図の明文化余地あり |
| lint/test 拡大 | リスク評価は十分。lint は ui 既存違反の露見、test は worker 既存 CI 実行済みという整理で妥当 |
| CI | turbo 集約と DB/pgTAP 分離は妥当。`test:db` を turbo に入れない判断も起動前提の違いから自然 |
| 検証 | 主要観点は揃っている。root alias と CONTRIBUTING 更新確認を足すと十分条件に近づく |
| 判断ログ | 採用理由 / Dockerfile 非変更 / script 非リネームは十分。root `test` と DB test 分離の判断を追加するとよりよい |

verdict: APPROVE
