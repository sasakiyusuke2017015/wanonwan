# AI 機能: 面談メンター提案 + 自由記述の要約/分析（Claude + pgvector）

> 由来: 親 Plan §10「AI 機能（FAQ/メンター）+ pgvector + LLM 基盤」。ユーザー指定の機能 = 面談メンター提案 + 自由記述の要約/分析。

| 項目 | 値 |
|---|---|
| 概要 | Phase A=Claude(`@anthropic-ai/sdk`/Sonnet 4.6)で面談要約（`lib/ai`+`POST /answers/[id]/summary`+UI、merged）。Phase B=pgvector RAG メンター提案（**自前ホスト埋め込み** TEI/e5-small・profile ai・社外送信なし、lazy 生成、`POST /answers/[id]/mentor`+UI、key/URL 未設定で無効）。**いずれもキー/URL 未設定で外部送信ゼロ** |
| ステータス | 🟢 マージ済み（検証中） |
| PR | Phase A: [#42](https://github.com/sasakiyusuke2017015/wanonwan/pull/42)（merged） / Phase B: [#43](https://github.com/sasakiyusuke2017015/wanonwan/pull/43)（merged） / 再land fix: [#49](https://github.com/sasakiyusuke2017015/wanonwan/pull/49)（merged） |

---

## 1. 目的 / 非目的

### 目的

1. **自由記述の要約/分析**: 回答・面談メモの自由記述を Claude で要約・課題抽出し、管理者の振り返りを支援。
2. **面談メンター提案**: 面談者（上司）に、回答内容 + 類似の過去面談（pgvector で検索）を文脈に、次アクション/話すべき点を Claude が提案。

### 非目的

- FAQ/ナレッジ検索 UI（ユーザー未選択）。
- 自動意思決定・人事評価の自動化（提案は補助、最終判断は人）。
- リアルタイムチャット bot。
- モデルの自前ホスト（Claude は API 経由が前提。自前 LLM は採用しない）。

---

## 2. 現状コンテキスト

- pgvector 拡張は `00_bootstrap.sql` で**導入済みだが未使用**（vector 列・embedding なし）。
- LLM 連携コードは皆無。`ANTHROPIC_API_KEY` 等の secret 配線なし。
- 面談データは `answers` 上（interview_memo / next_action / evaluation / health_status 等、自由記述含む）。RLS で本人/面談者/admin に限定。
- **claude-api スキル要点**: SDK は `@anthropic-ai/sdk`（サーバ専用呼び出し）。**Anthropic に埋め込み API は無い** → pgvector 用の埋め込みは別プロバイダが要る。

---

## 3. 先に承認が要る重大判断（外部送信を有効化する前のブロッカー）

> これらは **組織/笹木さんの意思決定**。**有効化（＝実際の外部送信）は承認まで行わない**。
> ただし **disabled-by-default の実装（コード・UI）は承認前でも先行してよい**: 外部送信は
> **二重 gate**（`ANTHROPIC_API_KEY` 設定 **かつ** `AI_EXTERNAL_PROCESSING_APPROVED=true`）で守られ、
> 承認フラグ未設定の限り 503 を返し外部送信ゼロ。key 単独では有効化しない（テスト目的の key 混入で
> 面談データが流れる事故を防ぐ）。stg/prod は `check-secrets` が「key あり・承認フラグ無し」を fail-closed で拒否する。

### 3.1 プライバシー — HR データの外部送信（最重要）

面談・健康・評価・自由記述は**センシティブな従業員データ**。Claude API（および埋め込みプロバイダ）への送信は**外部送信＝第三者処理**になる。

- 必要な確認: (a) 従業員データを外部 LLM に送ることの**社内承認/規程適合**（個人情報・就業規則・労使）、(b) Anthropic の**データ保持/学習除外**（API はデフォルト学習不使用だが保持期間あり。モデルにより 30 日保持必須等）、(c) **DPA / オプトイン**、(d) 送る範囲の最小化（健康ステータス等は送らない/マスクする選択）。
- 代替: 自由記述のみ送る・個人識別子を除去して送る・社外送信を避け要約は社内のみ等。**この方針が決まらないと設計が固定できない**。

### 3.2 埋め込みプロバイダ（pgvector の前提）

Anthropic に埋め込み API が無いため、メンター提案の RAG（類似過去面談検索）には別途必要:

| 選択肢 | 長所 | 短所 |
|---|---|---|
| **Voyage AI**（Anthropic 推奨） | 高品質・Claude と相性 | また別の外部 API（プライバシー二重）+ 鍵管理 |
| OpenAI Embeddings | 実績豊富 | 外部・別ベンダ |
| **自前ホスト埋め込み**（例: ローカル embedding サーバ） | データが外に出ない（プライバシー◎・自前ホスト思想と整合） | 運用負荷・compose にサービス追加・精度/言語対応の検証 |

> 自前ホスト思想（Pleasanter 排除・セルフホスト）と HR データ機微を踏まえると **自前ホスト埋め込み**が思想的に最も整合。ただし運用コスト増。**要決定**。

### 3.3 モデルと同期/非同期

- モデル: 既定 **Sonnet 4.6**（$3/$15、要約・提案に十分）。最難ケースのみ Opus 4.8。
- 実行: 要約/提案は **オンデマンド同期**（管理者が押したとき）で開始。埋め込み生成は**非同期**（pgmq/pg_cron。これは「箱の穴」で挙げた非同期通知基盤と同じく未実装 → 先に or 同時に整備が要る）。

---

## 4. 実装ステップ（3.1–3.3 承認後）

### Phase A — LLM 基盤（要約/分析、埋め込み不要）— 実装仕様

> **安全性**: コードは `ANTHROPIC_API_KEY` 未設定では動かない（外部送信ゼロ）。CI は SDK をモック。
> **実送信は §3.1 承認 + 笹木さんが key を設定した環境でのみ**発生する。

1. **依存**: `apps/web` に `@anthropic-ai/sdk` 追加。
2. **env**: `apps/web/.env.example` に `ANTHROPIC_API_KEY=`（既定空・**承認後にのみ設定**）+ `AI_MODEL=claude-sonnet-4-6`（任意上書き）。stg/prod は check-secrets 経路（任意 secret 扱い）。
3. **lib（server-only）**:
   - `apps/web/lib/ai/client.ts`: `new Anthropic({ apiKey })` + `AI_MODEL`（既定 `claude-sonnet-4-6`）。
   - `apps/web/lib/ai/summarize.ts`: 純関数 `buildSummaryPrompt(text)` / `extractText(blocks)` + `summarizeInterview(text)`（client を使う薄いラッパ）。
   - **unit test**: `buildSummaryPrompt`（本文を含む）/ `extractText`（text ブロックのみ連結・他は無視）を純関数として検証（SDK 不要・Docker 不要）。
4. **API**: `POST /api/v1/answers/[id]/summary`（`withActiveUser`）。tx で `interview_memo`/`next_action` を **面談者 or admin に限定**して取得（`app.is_admin() OR interviewer_id = app.uid()`、0 行→403）。本文空→400。Claude 失敗→502。成功→`{ data: { summary } }`。**都度生成（DB 非保存）** で開始。
5. **UI**: 面談画面に「AI 要約」ボタン + 結果表示（小コンポーネント）。「提案は補助・最終判断は人」の注記を添える。

### Phase B — pgvector + メンター提案（埋め込み要）
5. 埋め込みプロバイダ lib（3.2 の決定に従う）+ `answers` か別表に `embedding vector(N)` 列 + ivfflat/hnsw index。
6. 非同期: 面談確定時に embedding 生成ジョブを pgmq へ enqueue、pg_cron/worker が消化（非同期通知基盤の整備とセット）。
7. メンター提案 API: 対象回答 + 類似過去面談（pgvector 近傍）を文脈に Claude へ → 提案返却。RLS で参照可能な範囲のみ検索。
8. UI: 面談画面に「メンター提案」表示。

---

## 5. 検証

- `pnpm --filter @wanonwan/web test`（ai lib のモック unit test）/ `typecheck` / `lint` green。
- pgTAP: embedding 列の RLS（他人の面談 embedding を引けない）。
- **マージ後（Docker・笹木さん）**: 実 API キーで要約/提案が返る、類似検索が妥当、レイテンシ/コスト確認。
- ※外部 API 呼び出しは CI では叩かない（モック）。実呼び出しは笹木さん環境。

## 6. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| HR データの外部送信が規程/法令に抵触 | 重大（コンプラ） | §3.1 を実装前に組織承認。送信最小化・マスキング・自前ホスト埋め込み検討 |
| 埋め込みが第二の外部依存 | プライバシー/コスト二重 | 自前ホスト埋め込みを第一候補に |
| LLM コストが読めない | 予算超過 | Sonnet 既定 + max_tokens 上限 + オンデマンドのみ + 利用ログ |
| 非同期基盤未整備（pgmq/pg_cron ジョブ無し） | embedding 生成の置き場が無い | Phase B は非同期通知基盤の整備が前提。基盤 Plan を先行 or 同梱 |
| 提案の誤り/幻覚を人事判断に使う | 誤用 | 「提案は補助・最終判断は人」を UI 明記。出典（参照した過去面談）を提示 |
| プロンプトに機微情報が残る/ログ流出 | 情報漏洩 | サーバ側のみ・ログに本文を残さない・secret 管理 |

## 7. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-18 | 機能は「自由記述の要約/分析」+「面談メンター提案」に限定（FAQ 検索は対象外） | ユーザー選択 |
| 2026-06-18 | LLM は Claude（`@anthropic-ai/sdk`、サーバ専用）、既定 Sonnet 4.6 | コスト/品質バランス。最難のみ Opus 4.8 |
| 2026-06-18 | 埋め込みは別途必要（Anthropic に埋め込み API 無し）。プロバイダは **要決定**（自前ホストを第一候補） | claude-api スキルで確認。HR データ機微 + 自前ホスト思想 |
| 2026-06-18 | Phase A（要約）と Phase B（pgvector 提案）に分割。A は埋め込み不要で先行可 | A は外部 LLM のみで完結、B は埋め込み + 非同期基盤が要る |
| 2026-06-18 | **実装前に §3.1 プライバシー承認を必須化** | 従業員 HR データの外部送信は組織判断 |
| 2026-06-18 | **機能は「`ANTHROPIC_API_KEY` を env に入れるまで動かない」設計で実装**（キー未設定＝外部送信ゼロ・503 で無効）。キーを入れる行為＝組織が外部送信を有効化する判断 | コードはキー無しでは送信しない安全な土台。有効化の意思決定を env キー投入に一本化（笹木さん/組織） |
| 2026-06-19 | **key 単独 gate → 二重 gate に強化**（key + `AI_EXTERNAL_PROCESSING_APPROVED=true`）。`check-secrets` で「key あり・承認無し」を fail-closed で拒否。disabled-by-default 実装は承認前でも先行可と明文化 | レビュー指摘（BLOCKER）: テスト目的の key が stg/prod に紛れると面談データが即外部送信され得る。承認の意思を別フラグに分離し fail-safe 化 |
| 2026-06-19 | **送信データ最小化/マスキング（§3.1(d)）は承認時に確定する明示ステップ**として残課題化（現状は要約=memo+next_action、メンター=対象+類似3件をそのまま送信。承認前は無効なので実害なし） | レビュー指摘（HIGH）: 有効化前に送信 field/文字数/類似件数を Plan に固定する必要 |

## 8. ステータス

- [ ] Plan ドラフト完成（本ファイル）
- [ ] **§3.1 プライバシー方針の組織/笹木さん承認**（最優先ブロッカー）
- [ ] §3.2 埋め込みプロバイダ決定 / §3.3 モデル・同期方針確認
- [ ] 計画レビュー / 笹木さん承認
- [x] Phase A 実装（`@anthropic-ai/sdk` + `lib/ai`(client/summarize, 純関数 unit test 4) + `POST /answers/[id]/summary`(key-gate 503 / 面談者・admin 限定 / 502) + InterviewForm に AI 要約 UI + env キー空既定）。typecheck/lint/test green。**キー未設定で外部送信ゼロ**
- [ ] Phase A コードレビュー
- [x] §3.2 埋め込みプロバイダ決定 = **自前ホスト**（compose に TEI/multilingual-e5-small・profile ai・社外送信なし）
- [x] Phase B 実装（embeddings コンテナ(profile ai) + `lib/ai/embed`(unit 4) + `answers.embedding vector(384)` + hnsw + `lib/ai/mentor`(unit 2) + `POST /answers/[id]/mentor`(key/URL-gate 503・面談者/admin・lazy 埋め込み・pgvector 近傍・Claude 提案) + InterviewForm に UI）。typecheck/lint/test green。**非同期基盤は使わず lazy 生成で MVP**（孤児/再 index は後続）
- [x] レビュー指摘 BLOCKER 対応: 外部送信を二重 gate 化（key + `AI_EXTERNAL_PROCESSING_APPROVED`）+ `check-secrets` で key あり・承認無しを fail-closed 拒否 + .env.example + Plan 矛盾解消
- [ ] **承認時に確定**: 送信データの最小化/マスキング（§3.1(d)）— 送信 field・文字数・類似件数を確定（レビュー HIGH。有効化前に必須）
- [ ] マージ後検証（Docker・笹木さん: 承認フラグ + key 設定で要約/メンターが返る・未設定で 503）
