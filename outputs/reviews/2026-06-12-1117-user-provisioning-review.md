# Security Review — user-provisioning

**Branch:** `feature/user-provisioning`
**Reviewed:** 2026-06-12
**Reviewer:** security-reviewer agent
**Plan:** [2026-06-11-1730-pleasanter-exit-1on1-rebuild.md](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)
**Scope:** 管理画面でのユーザー作成時に GoTrue identity を同時発行し `users.gotrue_id` を紐付ける実装

## サマリ

- **Critical / BLOCKER:** 0
- **High / NICE-TO-HAVE:** 5
- **Risk Level:** 🟢 LOW
- **Verdict:** APPROVE

BLOCKER は無し。認可ゲートは GoTrue 呼び出しより前に置かれ、最終ガードの RLS が
二層目として fail-closed で機能している。service_role トークンは短命・サーバ内限定で
漏洩面が小さく、初期パスワードのエントロピーも十分。以下は全て NICE-TO-HAVE。

---

## 重点項目ごとの所見

### 1. 認可（admin ゲート vs RLS 二層） — 🟢 OK

- `POST` は `getCurrentClaims()` で認証を確認 → `app.is_admin()` を **GoTrue 呼び出しより前**に
  評価し、非 admin は 403 で打ち切る（route.ts:52-65）。GoTrue createUser に到達する前に弾けている。
- admin 判定は `withUser(claims.sub, ...)` 内で実行され、RLS コンテキスト
  (`set_config('app.user_id', sub, true)`) 配下の `app.is_admin()`（SECURITY DEFINER,
  `search_path` 固定）を使う。クライアントが渡せる値ではなく、検証済み JWT の `sub` 由来。
  バイパス経路は見当たらない。
- 最終ガードの RLS `users_write`（`WITH CHECK app.is_admin()`）が insert 時に二層目として効く。
  仮に API ゲートを将来うっかり外しても DB が拒否する。妥当な多層防御。
- **service_role トークンのリプレイ耐性**（重点 2 と関連）: 万一 service_role JWT が
  `verifyAccessToken` 経路に流れ込んでも、`role`/`aud` を検証しないため `sub: ""` となり、
  `app.current_user_id()` が `NULLIF(..., '')::uuid` で NULL を返す → RLS fail-closed・
  `is_admin()` false。アプリ側で昇格できない設計になっている（00_bootstrap.sql:44, db/client.ts:19）。

### 2. service_role トークン — 🟢 OK（指摘 A は NICE-TO-HAVE）

- `mintServiceRoleToken()` は jose で HS256・`GOTRUE_JWT_SECRET` 署名・`exp 60s`・
  使い捨て。サーバ内（`import "server-only"`）でのみ生成し、レスポンス／ログには一切出ない。
- トークン文字列が外部に出る箇所は無し（createUser/deleteUser の `Authorization` ヘッダのみ）。
- `exp 60s` は同期 admin 呼び出し直後に破棄される使い方として妥当。短すぎて失敗するリスクも低い。
- [NICE-TO-HAVE A] クレーム最小性: 現状 `aud: "authenticated"` を付与しているが、これは
  本来エンドユーザー access_token 用の aud。service_role 用途には不要で、むしろ
  「access_token に見える service_role トークン」を作っている。`verifyAccessToken` が
  aud/role を検証していない現状では実害は出ないが（→ 指摘 B）、将来 aud 検証を入れたときの
  事故を避けるため、service_role トークンには `aud` を付けない or `role: "service_role"` のみで
  発行するのが clean。

### 3. 初期パスワード — 🟢 OK（指摘 C は NICE-TO-HAVE）

- `randomBytes(20)` を CSPRNG として使用。20 文字 × log2(55) ≈ **115bit** で十分。
- レスポンスで 1 度だけ返し、ログには出さない（route.ts:107, provisioning.ts:24 コメント通り）。
  UI も再表示不可で `select-all` 提示のみ（UserForm.tsx:111-142）。平文を永続化していない。
- 管理者発行 → 口頭/メモで本人へ、という運用前提なのでレスポンス返却は妥当な設計判断。
- [NICE-TO-HAVE C] **modulo bias**: `bytes[i] % 55`（PASSWORD_ALPHABET 長 55）。
  256 = 4×55 + 36 なので、アルファベット先頭 36 文字がわずかに高頻度（5/256 vs 4/256）。
  20 文字でも実効エントロピーは依然 110bit 超で攻撃上の問題は無いが、厳密にやるなら
  rejection sampling（`bytes[i] >= 220` を捨てる）か `% 64` のべき乗アルファベットにする。

### 4. orphan / 不整合 — 🟢 OK（指摘 D は NICE-TO-HAVE）

- GoTrue 作成成功 → DB insert 失敗時に `deleteUser` で掃除（route.ts:108-116）。
  掃除失敗時も「orphan GoTrue ユーザーが残るが業務ユーザーは未作成」という安全側に倒れる
  （その gotrue_id でログインしても `users` 行が無く `app.uid()` が解決しない＝実害小）。
- TOCTOU: GoTrue 作成前の重複チェックと insert の間に競合で同 email/code が割り込んでも、
  insert 時の UNIQUE 制約（mapDbError 23505 → 409）＋ GoTrue 側 422/409（→ 409）で
  最終的に拒否される。二重作成にはならず、orphan 掃除も走る。許容範囲。
- [NICE-TO-HAVE D] 掃除失敗時に orphan が残った事実を **構造化ログ／監視に残す**と運用で拾える
  （現状は握りつぶしコメントのみ）。パスワードや token を含めず gotrue_id だけ記録するなら漏洩面なし。

### 5. 情報漏洩 / エラー粒度 — 🟢 OK（指摘 E は NICE-TO-HAVE）

- DB エラーは `mapDbError` でコード→汎用メッセージに変換し詳細を出さない（errors.ts）。
- GoTrueError は status のみ参照し、422/409 を「既に登録されています」、それ以外を 502
  「認証ユーザーの作成に失敗しました」に丸める。GoTrue の生メッセージ/body はクライアントに出ない。
- [NICE-TO-HAVE E] **email 存在 oracle**: admin 専用エンドポイントなので脅威度は低いが、
  重複時 409「コードまたはメールが重複しています」は、admin に対してのみ意図的に存在を
  教えている（運用上必要）。非 admin は admin ゲートで先に 403 になるため oracle 化しない。
  → 現状で問題なし。記録のみ。

### 6. 入力検証 / SQLi — 🟢 OK

- email/code 等は `valibot`（CreateUserSchema）で検証済み。email は `v.email()`、
  code/name は `minLength(1)`、org id は `v.optional(v.number())`。parse 失敗は 400。
- DB アクセスは全て postgres.js のタグ付きテンプレート（`tx\`... ${input.email} ...\``）で
  パラメータ化されており、文字列連結は無い。SQLi 経路なし。
- `set_config('app.user_id', ${gotrueSub ?? ""}, true)` も値はプレースホルダ化。GUC 注入なし。

---

## セキュリティチェックリスト

- [x] ハードコードされた秘密情報がない（dev フォールバック secret は本番 throw・dev 限定で許容）
- [x] 全入力がバリデーションされている（valibot）
- [x] SQL injection 対策（postgres.js パラメータ化）
- [x] 認証必須（getCurrentClaims → 401）
- [x] 認可検証（API ゲート app.is_admin() + RLS users_write 二層）
- [x] シークレットがレスポンス／ログに出ていない（token / 平文 PW とも）
- [x] エラーメッセージが安全（汎用化、生エラー非開示）
- [x] orphan ロールバック実装あり（deleteUser）
- [ ] レートリミット（admin エンドポイント・後続予定。BLOCKER ではない）

---

## 残課題（後続タスク・本 PR では BLOCKER 外）

1. service_role トークンのクレーム最小化（`aud` を外す／role のみ） — 指摘 A
2. パスワード生成の modulo bias 解消（rejection sampling か 64 文字アルファベット） — 指摘 C
3. orphan 掃除失敗時の構造化ログ／監視（gotrue_id のみ記録） — 指摘 D
4. 作成エンドポイントのレートリミット（前提どおり後続）
5. email 変更時の GoTrue 同期 / 初回 force-change（前提どおり後続）

---

## Verdict

**APPROVE**
