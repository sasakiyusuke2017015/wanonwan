# Plan: turbo (Turborepo) 導入 + scripts ergonomics 整理

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-22 14:47 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | `feature/turbo-monorepo` |
| 関連 PR | TBD |
| レビュー | [計画レビュー](../reviews/2026-06-22-1558-turbo-monorepo-review.md)（APPROVE） / [コードレビュー](../reviews/2026-06-22-1902-turbo-monorepo-review.md)（APPROVE） |

## 目的

monorepo のタスク実行を **turbo (Turborepo)** に統一し、`build` / `lint` / `typecheck` /
`test` を `turbo run <task>` 経由にする。主目的は **ai-education と同じ操作体系に揃え、
笹木さんがプロジェクト間を行き来する際の学習コストを下げる**こと。副次的に依存グラフ順の
実行明示・ローカル/CI キャッシュによる再実行スキップが得られる。

あわせて、ai-education に存在し waoon に欠けている **clean 系スクリプト**を追加し、
[docs-style.md](../../.claude/rules/docs-style.md) が既に言及している `clean:build` の
実体を用意する（現状は doc にだけ存在してスクリプトが無い）。

## スコープ

### やること

- root に turbo を devDependency 追加 + `turbo.json` 新規作成
- root `package.json` の `build` / `lint` / `typecheck` / `test` を `turbo run` に変更
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml) の該当ステップを turbo 経由へ
- `clean` / `clean:build` / `clean:cache` スクリプト追加（Windows-safe）
- [CLAUDE.md](../../CLAUDE.md) スタック表「パッケージ / 構成」行に turbo を追記
- `.gitignore` に `.turbo/` を追加

### やらないこと（スコープ外）

- **Dockerfile への turbo 導入はしない**。[infra/Dockerfile.web](../../infra/Dockerfile.web) は
  image 内で `pnpm --filter @waoon/web build` を直接呼ぶ設計を維持する（image に turbo を
  足さない / build context を変えない）。CD 経路は無変更。
- **既存スクリプトの大規模リネームはしない**（`dev:up` / `compose:dev:*` / `db:*` /
  `test:db` 等）。これらは CLAUDE.md・検証ファイル・docs-style・git-workflow など複数 docs が
  参照しており、リネームすると広範な doc drift を生む。ergonomics は **additive（追加のみ）**
  に留める（→ 判断ログ）。
- turbo の **Remote Cache（Vercel/自前）** は今回入れない。ローカル + CI のローカルキャッシュのみ。

## 現状コンテキスト

- workspace: `apps/web` `apps/worker` / `packages/auth` `packages/domain` `packages/ui`
  （[pnpm-workspace.yaml](../../pnpm-workspace.yaml)）。turbo.json なし・turbo 依存なし。
- 各 package の scripts（実測）:
  - `@waoon/web`: dev / build(next build) / start / typecheck / lint / test(vitest run) / test:watch
  - `@waoon/worker`: start / typecheck / test
  - `@waoon/auth` `@waoon/domain`: typecheck のみ
  - `@ui-catalog/core`(packages/ui): typecheck / lint / clean / storybook 系 / test:storybook 他
- root scripts 現状（抜粋）: `typecheck=pnpm -r typecheck` / `lint=pnpm --filter @waoon/web lint` /
  `build=pnpm --filter @waoon/web build`。**root に `test` は無い**（CI が web/worker を個別実行）。
- CI（[ci.yml](../../.github/workflows/ci.yml)）: Typecheck → Lint → Build(web) → Test(web) →
  Test(worker) → DB スタック起動 → migrate → seed → pgTAP → down。
- packageManager: `pnpm@10.15.1` / engines: node>=22, pnpm>=10。
- 技術選定メモ由来のスタック表（[CLAUDE.md:33](../../CLAUDE.md#L33)）は「pnpm + pnpm workspace」。
  turbo は**明記なし**（却下ではなく未検討。→ 判断ログ）。

## 実装計画

### Phase 0: 着手前ゲート（ui lint 露見リスクの先出し）— ✅ クリア済み

本 Plan で **唯一 CI を赤にしうる実リスクは lint 拡大**（turbo 化で `@ui-catalog/core` の
eslint が CI で初めて走る）。これは ui の lint が未設定の dead script だったため発覚し、
別 PR [#50](https://github.com/sasakiyusuke2017015/waoon/pull/50)（[ui-eslint Plan](2026-06-22-1626-ui-eslint-setup.md)）で
ui に eslint を整備し lint を green 化して **解消済み**。develop には #50 がマージ済みで、
`pnpm --filter @ui-catalog/core lint` は exit 0。よって本 Plan は当初の完全形
（`lint: turbo run lint` 込み）で進める。

### Phase 1: turbo 本体

1. `pnpm add -Dw turbo` で root に turbo（2.x）を追加。
2. `turbo.json` を作成（turbo 2.x は `tasks` キー）:
   ```json
   {
     "$schema": "https://turbo.build/schema.json",
     "tasks": {
       "build": { "dependsOn": ["^build"], "outputs": [".next/**", "!.next/cache/**", "dist/**"] },
       "typecheck": { "dependsOn": ["^typecheck"] },
       "lint": {},
       "test": { "dependsOn": ["^build"] }
     }
   }
   ```
   - `typecheck` は **`^typecheck`**: 全 package が typecheck script を持つため、依存先の型が
     通ってから依存元、という順序が実際に発火する（副目的「依存グラフ順の実行明示」の実体）。
   - `build` / `test` の `^build` は **現状 no-op**（build script を持つ package が web のみ＝
     依存解決対象ゼロ）。エラーにはならず、将来 build を持つ package が増えたときの予防的宣言
     として残す（→ 判断ログ）。
3. `.gitignore` に `.turbo/` 追加。`infra/Dockerfile.web` は `COPY . .`（[Dockerfile.web:23](../../infra/Dockerfile.web#L23)）
   で build context を取り込むため、`.dockerignore` 有無を確認し、無ければ `.turbo` が image に
   持ち込まれないよう手当てするか「無害（build に使わない）」を確認する。

### Phase 2: root scripts 差し替え

4. root `package.json`:
   - `"build": "turbo run build"`
   - `"lint": "turbo run lint"`
   - `"typecheck": "turbo run typecheck"`
   - `"test": "turbo run test"`（新規）
   - 既存の `dev` / `compose:*` / `db:*` / `test:db` / `provision:*` 等は**そのまま**。

   ⚠ 挙動変化に注意（→ リスク）:
   - `lint`: 現状 web のみ → turbo 化で web + ui の両方が走る。
   - `test`: turbo 化で web + worker の両方が走る。

### Phase 3: clean 系スクリプト（ergonomics）

5. `clean` / `clean:build` / `clean:cache` を追加。Windows(PowerShell 5.1)安全のため
   [docs-style.md](../../.claude/rules/docs-style.md) の方針どおり rimraf + リテラル列挙で書く:
   - `clean:build`: build 成果物を列挙削除。**ui は `build` を持たず `dist` を生成しない**ため
     `packages/ui/dist` は入れず、実生成物（`apps/web/.next` / `packages/ui/storybook-static` /
     `.turbo`）に合わせる。storybook 系は ui 側 package の `clean` に委譲するかは実装時に確定。
   - `clean`: node_modules も含めた全消し（列挙）
   - `clean:cache`: `pnpm store prune`
   - rimraf を devDependency に追加。
   - 注: ui 既存の `clean`（`rm -rf ...`、Windows 非対応）は **本 Plan のスコープ外**（既存
     script 非変更）。指摘に留め修正しない。

### Phase 4: CI 反映

6. [ci.yml](../../.github/workflows/ci.yml) の Typecheck / Lint / Build(web) / Test(web) /
   Test(worker) を turbo 経由に集約:
   ```yaml
   - name: Verify (turbo)
     run: pnpm turbo run typecheck lint build test
   ```
   - DB スタック〜pgTAP（`compose:dev:*` / `db:migrate` / `db:seed` / `test:db`）の各ステップは
     **無変更**（turbo タスクではない）。turbo ステップが fail したら後続 DB 系は GitHub Actions の
     既定で skip される（無駄に DB を立てない）→ 検証で確認。
   - 任意: `.turbo` を `actions/cache` でキャッシュ（効果を見て判断。初回は入れなくてよい）。

### Phase 5: docs 反映

7. [CLAUDE.md:33](../../CLAUDE.md#L33) スタック表を「pnpm + pnpm workspace + **Turborepo**（タスク実行）」に更新。
8. [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) のテスト・チェック表を最小更新（root `pnpm test`
   新設、`pnpm build`/`lint`/`typecheck` が turbo 経由になる旨）。drift しない範囲で最小。

## 検証

- [x] `pnpm install` 後 `pnpm turbo run typecheck lint build test` がローカルで green（10 タスク成功）
- [x] root alias も確認: `pnpm typecheck` / `pnpm lint` / `pnpm build` / `pnpm test`（新設）が通る
- [x] 2 回目実行で turbo の `FULL TURBO`（キャッシュヒット）が出る（10 cached / 78ms）
- [x] `pnpm lint` 拡大（web + ui）で両方通る（#50 で ui lint green 化済み）
- [x] `pnpm test` 拡大（web + worker）で両方の vitest が通る
- [x] `pnpm clean:build` → `pnpm build` が成功（`.turbo`/`.next` 削除後に再ビルド成功）
- [x] `clean:build` の rimraf `-g` グロブが動作（Linux 実測。Windows は rimraf 内蔵 glob + クオートで shell 展開回避 → `EINVAL` 回避設計）
- [x] **lockfile**: turbo/rimraf 追加後の `pnpm-lock.yaml` が `pnpm install --frozen-lockfile` で解決（exit 0）
- [ ] CI が turbo ステップ込みで green（PR 後に確認）。turbo fail 時に後続 DB 系ステップが skip される
- [ ] CD（image build）が無変更で従来どおり通る（`.dockerignore` に `**/.turbo` 既存・Dockerfile は
      `pnpm --filter` 維持で turbo 非依存。実起動確認は笹木さん）

## リスク

| リスク | 影響 | 緩和 |
|---|---|---|
| `lint` が ui まで拡大して既存違反が露見（**本 Plan 唯一の CI 赤リスク**。CI も現状 web のみ lint） | CI 赤 | **Phase 0 の着手前ゲート**で `pnpm --filter @ui-catalog/core lint` を先行実行し件数を判断ログ化。多数なら lint 拡大を切り離す／別 Issue 化 |
| `test` が worker まで拡大 | CI 赤/時間増 | 既に CI は worker test を実行済み。turbo 化で重複しないことを確認 |
| turbo の outputs 設定漏れでキャッシュ不整合 | 古い成果物配信 | `.next/**`(cache 除外) / `dist/**` を明示。疑わしければ `--force` で確認 |
| Dockerfile が将来 turbo 前提に書き換わる誤解 | CD 破壊 | Plan スコープ外と明記。Dockerfile は `pnpm --filter` 維持 |
| 技術選定メモに無いツール追加 | 方針逸脱の疑義 | 判断ログに採用理由を記録。CLAUDE.md スタック表へ反映 |
| Windows での clean glob | ローカル作業不能 | rimraf `-g` + クオート or リテラル列挙（docs-style 準拠） |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-06-22 | turbo を採用する | 技術選定メモは「pnpm + pnpm workspace」で turbo を**却下したのではなく未検討**。ai-education が turbo を採用しており、両プロジェクトの操作体系を揃えることで笹木さんの学習コストを下げる狙い。turbo は既存スクリプトをラップする additive な導入で剥がしやすく低リスク |
| 2026-06-22 | Dockerfile に turbo を入れない | image 内 build は `pnpm --filter @waoon/web build` で完結しており、turbo を足すと image 肥大化と build context 変更のリスク。CD 経路は触らない |
| 2026-06-22 | 既存スクリプトの大規模リネームはしない（ergonomics は additive のみ） | `dev:up` / `compose:dev:*` / `test:db` 等は複数 docs が参照。ai-education 名へのリネームは広範な doc drift を生むコストが、得られる一貫性メリットを上回ると判断。clean 系の追加に留め、リネームが本当に要るなら別 Plan |
| 2026-06-22 | turbo.json: typecheck は `^typecheck`、build/test の `^build` は予防的宣言 | 計画レビュー（Codex N-1 + architect）反映。全 package が持つ typecheck だけが依存グラフ順を実体化できる。build を持つ package は web のみのため `^build` は現状 no-op だが、将来 build を持つ package 追加時の予防的宣言として残す |
| 2026-06-22 | root `test` は web + worker の Vitest 集約に留め、DB/pgTAP は分離維持 | 計画レビュー（Codex N-4）反映。`pnpm test` 新設で「全テストか？」の誤解を防ぐ。DB/pgTAP は起動前提が異なるため `test:db` として CI でも turbo 外に分離 |
| 2026-06-22 | lint 拡大リスクを着手前ゲート（Phase 0）に格上げ | 計画レビュー（architect 指摘 B）反映。ui lint が CI で初めて走る純増は本 Plan 唯一の CI 赤リスク。「落ちたら考える」ではなく着手前に件数を確認してスコープ判断する |
| 2026-06-22 | _Phase 0 結果_: ui の lint は「違反多数」ではなく **未設定（eslint 依存・設定ファイルなしの dead script）** だった。`pnpm --filter @ui-catalog/core lint` は `eslint: command not found` で失敗 | CI が web のみ lint していたため露見していなかった |
| 2026-06-22 | **スコープ拡張**: ui に eslint を整備する（笹木さん承認） | Phase 0 の結果を受けた判断。lint を turbo 化するなら ui の lint が機能している必要がある。web と同じ flat config（eslint 10 / typescript-eslint 8）を ui にも導入。違反が大量なら本ログに件数と対処（auto-fix / 一部 warn 降格 / 別 Issue）を追記する |
| 2026-06-22 | **ui eslint 整備を別 PR に分離**（笹木さん承認）。本 turbo Plan の lint 拡大はそれ待ち | ui lint 違反 38 件（一部コンポーネント本体修正）は turbo 導入と関心が異なるため [2026-06-22-1626-ui-eslint-setup.md](2026-06-22-1626-ui-eslint-setup.md) として独立 PR 化。**turbo Plan の `lint: turbo run lint` 化は ui-eslint PR マージ後**に行う（それまで root `lint` は web のまま）。turbo PR を先行させる場合は typecheck/build/test のみ turbo 化し、lint は後続 follow-up とする |

## ステータス

- [x] 計画レビュー（[Codex](../reviews/2026-06-22-1558-turbo-monorepo-review.md) APPROVE / architect agent APPROVE。両者 BLOCKER なし。NICE-TO-HAVE は本 Plan に反映済み）
- [x] Plan 承認（笹木さん）
- [x] 実装（Phase 0 は #50 で解消済み。Phase 1–5 完了。ローカル検証 green）
- [x] コードレビュー（[APPROVE](../reviews/2026-06-22-1902-turbo-monorepo-review.md)。Claude Code + code-reviewer agent。BLOCKER なし。globalDependencies の LOW は本 PR で対応済み）
- [ ] PR 作成 → 笹木さんマージ承認
- [ ] PR merge
- [ ] マージ後検証（CI green / CD image build）
