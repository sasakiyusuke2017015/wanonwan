# Plan: 編集時の GoTrue 同期 + 初回ログイン後の force-change

| 項目 | 値 |
|---|---|
| 概要 | 親 Plan「認証の残」A+B。admin の email/password 変更を GoTrue へ同期（admin client に updateUser 追加）+ 初回 PW の強制変更（force-change を API 層ゲートで enforce、middleware はページ誘導） |
| ステータス | ✅ 検証完了 |
| 前提 Plan | [pleasanter-exit-1on1-rebuild](2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) の「認証の残」（[§10](2026-06-11-1730-pleasanter-exit-1on1-rebuild.md#L357): 編集時の email/password の GoTrue 同期 / 初回ログイン後の force-change） |

> provisioning（#19）で「作成時に GoTrue identity 発行 + 初期 PW 生成」までは完了済み。本 Plan は
> その後に残った 2 点 — **A) 編集時の email/password を GoTrue へ同期** と **B) 初回ログイン後の
> 強制パスワード変更** — を実装する。SMTP は入れない（deploy-infra D-5 確定）方針のまま、admin
> 再発行 + force-change だけで初回 PW 運用を閉じる。

---

## 1. 目的 / 非目的

### 目的

- **A: email/password 同期** — admin がユーザーの email を変更したら **GoTrue identity の email も
  更新**し、新 email でログインできる状態にする。あわせて **admin によるパスワードリセット経路**
  （サーバ生成 PW を一度だけ表示）を用意する。
- **B: force-change** — provisioning / PW リセットで配った初期 PW のまま使い続けられないよう、
  対象ユーザーを初回ログイン後に **`/change-password` へ強制**し、変更が済むまで他画面へ進ませない。

### 非目的

| 項目 | 理由 |
|---|---|
| SMTP / メール recover の実装 | deploy-infra D-5 で「入れない」確定。recover は admin 再発行のみ |
| 任意（強制でない）セルフパスワード変更の導線整備 | `/change-password` は認証済みなら誰でも開ける作りにするが、メニュー導線等の磨き込みは後続 |
| 本番エッジ(nginx)/Redis レートリミット | nginx 一次は #24 で実装済み。分散ストアは非ゴール（親 Plan 既述） |
| MFA / captcha / credential stuffing 対策 | 後続課題（親 Plan §10） |
| email 変更時の確認メール送信 | SMTP 無し。admin 操作なので `email_confirm:true` で即確定する |

---

## 2. スコープ境界

- **触る（既存）**:
  - `packages/auth/src/types.ts` — `CreateUserInput.appMetadata?` 追加、`UpdateUserAttributes` 型追加、`GoTrueClient.admin.updateUser` 追加。
  - `packages/auth/src/client.ts` — `admin.updateUser`（`PUT /admin/users/{id}`）追加、`createUser` で `app_metadata` を送れるように。
  - `apps/web/lib/auth/jwt.ts` — `AuthClaims.mustChangePassword` 追加（access token の `app_metadata` から抽出）。
  - `apps/web/middleware.ts` — **ページ専用のまま（`/api` は matcher 除外を維持）**。フラグが立つトークンはページを `/change-password` へリダイレクトするのみ。認証 API を壊さないため `/api` には手を入れない。
  - 新規 `apps/web/lib/auth/guard.ts`（または `current-user.ts` に追加）— **API 層の force-change ゲート（enforcement の主体）**。`getCurrentClaims` の結果で `mustChangePassword` を見て、非 allowlist の業務 API を 403 で弾く共通ヘルパ。各 route から呼ぶ。
  - `apps/web/app/api/v1/users/route.ts`（POST 作成）— 発行時に `app_metadata.must_change_password=true` を立てる。
  - `apps/web/app/api/v1/users/[id]/route.ts`（PUT）— email 変更時に GoTrue email を同期。
  - `apps/web/components/admin/UserForm.tsx` — 「パスワードをリセット」アクション（reset 経路を叩き、生成 PW を一度だけ表示）。
  - `apps/web/lib/auth/metadata.ts`（**必須**）— `must_change_password` のキー定数と app_metadata 組み立てヘルパ。文字列リテラルの散在（create / reset / change-password / jwt.ts の 4 箇所）を禁じる。
- **触る（新規）**:
  - `apps/web/app/api/v1/users/[id]/reset-password/route.ts` — admin による PW リセット（service_role で PW 再生成 + フラグ付与、生成値を一度だけ返す）。
  - `apps/web/app/api/v1/auth/change-password/route.ts` — 認証ユーザーが **current PW を再確認**して自分の PW を変更 + フラグ解除 + セッション再発行。IP レートリミット付き。
  - `apps/web/app/change-password/page.tsx` — 強制変更 UI（`@waoon/ui` 定石。現 PW + 新 PW + 確認入力）。
- **触らない（第一候補・claim 方式の場合）**: 業務テーブルの DDL / RLS。dev compose。GoTrue の docker 設定（`MAILER_AUTOCONFIRM=true` のまま）。`signInWithPassword` / `refresh` / `setSession` の既存挙動。
- **触る可能性（フォールバック・DB カラム方式の場合のみ／判断 #2）**: Step 3-B0 で「access token に `app_metadata` が載らない」と判明した場合に限り、`packages/db` の migration に `public.users.must_change_password boolean not null default false` を追加し、判定をレイアウト Server Component + API ゲートで DB から行う。**claim 方式が通れば DDL は触らない。** どちらか一方のみを真実源とし、両持ちしない。
- **前提（所与）**: Next.js 16 / React 19 / GoTrue `supabase/auth:v2.189.0`（HS256・`GOTRUE_JWT_SECRET`）/ `@waoon/ui` / Jotai。現行スタックは所与。

---

## 3. 現状コンテキスト（差分の起点）

- **PUT /api/v1/users/[id]** ([route.ts:54](../../apps/web/app/api/v1/users/[id]/route.ts#L54)) は `public.users.email` を更新するが **GoTrue identity を触らない**。→ admin が email を変えると DB は新 email、ログインは旧 email のままで **新 email でログイン不能**（実害バグ）。
- **admin client** ([client.ts:88-108](../../packages/auth/src/client.ts#L88-L108)) は `createUser` / `deleteUser` のみ。**`updateUser` が無い**のが A・B 共通の根本。
- **createUser** ([route.ts:75-83](../../apps/web/app/api/v1/users/route.ts#L75-L83)) は `app_metadata` を送っていない。
- **初期 PW** はサーバ生成 ([provisioning.ts:28](../../apps/web/lib/auth/provisioning.ts#L28)) し作成レスポンスで一度だけ返すが、**変更を強制する仕組みが無い**。
- **AuthClaims** ([jwt.ts:9-15](../../apps/web/lib/auth/jwt.ts#L9-L15)) は `sub/email/role/exp` のみ抽出。`app_metadata` は未参照。
- **middleware** ([middleware.ts](../../apps/web/middleware.ts)) は token の有無/有効性で `/login` リダイレクトするだけ。`/api` と静的アセットは `matcher` で除外済み。`PUBLIC_PATHS=["/login","/ui-demo"]`。
- **service_role JWT** はサーバ内で都度発行する既存ヘルパ ([provisioning.ts:10](../../apps/web/lib/auth/provisioning.ts#L10) `mintServiceRoleToken`) を使う。
- **GoTrue は外部公開しない**（deploy-infra 判断）。ブラウザは GoTrue を直叩きしない＝メタデータ改ざん経路は API 層のみ。

---

## 4. 設計判断

| # | 論点 | 決定 | 理由 |
|---|---|---|---|
| 1 | フラグ保存先 | **`app_metadata.must_change_password`**（第一候補）。フォールバックは `public.users` カラム（判断 #2） | `app_metadata` は **service_role のみ変更可**。`user_metadata` だとユーザー自身が PUT /user で書ける余地があり、PW 変更せずフラグだけ消す抜け道になる。**真実源は 1 つに固定し両持ちしない** |
| 2 | フラグの読み取り・**フォールバック** | 第一候補: access token の `app_metadata` claim を `AuthClaims` に抽出（毎リクエスト GoTrue 問い合わせ無し）。**Step 3-B0 で claim に実際に載るか検証**。載らない場合のフォールバックは ~~毎回 admin getUser~~（middleware/Edge で成立せず却下）→ **`public.users.must_change_password` カラムを真実源にし、判定をレイアウト Server Component + API ゲートで DB から行う** | 計画レビュー（architect BLOCKER）: Edge middleware から毎回 admin getUser は (a) 全遷移で同期 HTTP 往復、(b) Edge で service_role mint 可否が不明、で破綻。DB カラム方式は CLAUDE.md「認可は API 層が主」とも整合し、GoTrue 設定に依存しない確実な代替 |
| 3 | PW リセットの API 形 | **専用 `POST /users/[id]/reset-password`**（PUT に混ぜない） | create と同じ「生成 PW を一度だけ返す」レスポンス契約を、汎用 update と分離して明確にするため |
| 4 | email 同期の書き込み順序 | **GoTrue → DB の順。DB 失敗時は GoTrue email を旧値へ best-effort ロールバック** | GoTrue がログインの真実源。GoTrue 成功・DB 失敗でも「ログインは新 email で可能」な状態に倒し、旧 email を控えて巻き戻す。DB 先行だと「DB は新 email・ログインは旧」で admin の認識とズレる方が危険 |
| 5 | change-password 後のトークン | current PW 再確認 → PW 更新 → フラグ解除 → **`signInWithPassword` の戻り session（access+refresh 両方）を `setSession`** | 再ログインで mint される新トークンは解除後の状態を反映＝フラグ無し。**access だけでなく refresh も新世代に差し替える**（旧 refresh から失効後にフラグ復活させない）。これで強制ループに陥らない |
| 6 | force-change の enforcement | **API 層ゲートのみで完結**: フラグ持ちは非 allowlist の `/api/v1/*` を 403 で拒否する共通ゲート（`getCurrentClaims` 後に各 route が呼ぶ薄いラッパ）。allowlist = `auth/change-password` / `auth/logout` / `auth/me`。**middleware はページ専用のまま（`/api` は matcher 除外を維持）**で、フラグ持ちはページを `/change-password` へリダイレクト（`/change-password`・`/login` は素通し） | 計画レビュー（security/architect BLOCKER）: ページ層だけだと API 直叩きで全機能バイパス可能 → CLAUDE.md「認可は API 層が主」に従い **API 層で止める**。再計画レビュー（Codex BLOCKER）: middleware を `/api` まで広げると未ログインで叩く `login` / refresh cookie だけの `refresh` が `/login` リダイレクトで route に届かず認証 API が壊れる → **middleware は /api を触らない**。enforcement は API ゲート単独で十分（CLAUDE.md 方針とも一致） |
| 7 | change-password の current PW | **必須**（valibot `{ currentPassword, newPassword(min 12) }`）。`signInWithPassword(email, currentPassword)` で本人確認してから変更 | 計画レビュー（architect/security BLOCKER）: current 無しだと XSS/端末放置でセッションを奪った攻撃者が PW を掌握＝乗っ取り完成。force-change でも直前に初期 PW を打っているので再入力の UX 負荷は軽微。確認入力（new == confirm）は UI 側、長さ検証は API 側 |
| 8 | change-password / reset のレートリミット | **change-password に IP レートリミットを入れる**（既存 `rateLimit` 流用、login 同様）。reset は admin ゲートがあるため当面なし | 計画レビュー（code/security）: change-password は内部で `signInWithPassword` を 2 回叩くため GoTrue 増幅面になる。login/refresh と一貫させる |
| 9 | newPassword ポリシー | valibot で **最小 12 文字**（GoTrue 既定 6 より厳しめ） | 生成 PW が 20 文字なので手入力でも 12 は妥当。詳細ルールは過剰にしない |

---

## 5. 実装ステップ（順序付き）

> B は A の `updateUser` 基盤に乗る。Step 1（client 基盤）→ Step 2（A）→ Step 3〜5（B）の順。

### Step 1 — `@waoon/auth` admin client 拡張（A・B 共通基盤）
1. `types.ts`: `UpdateUserAttributes = { email?; password?; emailConfirm?; appMetadata?; userMetadata? }` を追加。`GoTrueClient.admin` に `updateUser(id, attrs, serviceRoleToken): Promise<GoTrueUser>` を追加。`CreateUserInput` に `appMetadata?` を追加。
2. `client.ts`: `admin.updateUser` を `PUT /admin/users/{id}`（body は `email`/`password`/`email_confirm`/`app_metadata`/`user_metadata` を **指定されたものだけ**送る）で実装。`createUser` は `app_metadata: input.appMetadata` を送る。
- 【検証】`pnpm typecheck` green。client の型が新メソッドを公開している。

### Step 2 — A: email 同期 + admin PW リセット
0. `metadata.ts`（必須）: `MUST_CHANGE_PASSWORD_KEY` 定数 + `mustChangeAppMetadata(flag)` ヘルパを作り、以降の 4 箇所で共用する。
1. PUT `/api/v1/users/[id]`:
   - **select 用 tx と update 用 tx を分ける**（間に GoTrue I/O を挟むため）。先に対象行（`gotrue_id`, 現 `email`）を select。0 行なら 404。
   - `email` が変わる場合: 他ユーザーとの重複は **GoTrue の email unique で最終判定**（422/409 → 409 変換）。DB 事前 dup select は早期 return の最適化として残すかは実装裁量（責務は GoTrue/DB unique 制約に置く）。`gotrue.admin.updateUser(gotrue_id, { email, emailConfirm:true })`。
   - GoTrue 成功後に DB update。**DB の unique violation も `mapDbError` 経由で 409 に落ちること**を確認。**DB 失敗時は GoTrue email を旧値へ戻す**（best-effort、失敗は `console.error` で gotrue_id のみ残す＝PW やレスポンスボディは出さない）。
   - `email` 不変の場合は従来どおり DB のみ。
2. 新規 `POST /api/v1/users/[id]/reset-password`:
   - admin ゲート（`app.is_admin()`、POST /users と同じ `tx\`select app.is_admin()\`` パターン）+ 対象の `gotrue_id` 取得。
   - `generateInitialPassword()` で生成 → `gotrue.admin.updateUser(gotrue_id, { password, appMetadata: mustChangeAppMetadata(true) })`。
   - レスポンスで `{ initialPassword }` を一度だけ返す（PW はログに出さない）。
3. `UserForm.tsx`: 編集時に「パスワードをリセット」ボタン → reset 経路を叩き、生成 PW を create と同じ once-only UI で表示。
- 【検証】admin で email 変更 → 新 email でログイン成功・旧 email で失敗。email 重複は 409（GoTrue 既存・DB 既存の両方）。reset → 返った PW でログインでき、かつ force-change が掛かる（Step 5 後に通し確認）。

### Step 3 — B: フラグの発行と読み取り ⟦真実源を決める分岐点⟧
1. create（POST `/users`）で `appMetadata: mustChangeAppMetadata(true)` を渡す（既存ユーザーには遡及しない＝強制対象は新規/リセット分のみ）。
2. `jwt.ts`: `verifyAccessToken` で `payload.app_metadata?.must_change_password === true`（**strict `=== true`、`Boolean()` で緩めない**）を `AuthClaims.mustChangePassword: boolean` に抽出。
- 【検証 B0 ＝この Plan の最重要ゲート】新規作成ユーザーでログイン → Cookie の access token を jwt デコーダ（または一時 `console.log(claims)`）で確認し、`app_metadata.must_change_password` が **実際に access token claim に載る**こと、さらに **reset 実行後に当該ユーザーが refresh / 再ログインすると新トークンに反映される**ことを確認する。
  - **載る場合** → claim 方式（第一候補）で Step 4・5 を進める。
  - **載らない場合** → 判断 #2 のフォールバックへ切替: `public.users.must_change_password` カラムを migration で追加し、判定をレイアウト Server Component + API ゲートで DB から行う（middleware の Edge では DB を読まない）。create/reset は DB カラムを true に、change-password は false に。以降の Step は「claim を読む」を「DB カラムを読む」に読み替える。

### Step 4 — B: enforcement（API 層ゲート単独 + middleware はページのみ）
1. **API ゲート（enforcement の主体）** `lib/auth/guard.ts`: `getCurrentClaims()` 後に `claims.mustChangePassword` が真なら、allowlist（`auth/change-password` / `auth/logout` / `auth/me`）以外の業務 API を **403 JSON** で拒否する共通ヘルパ。各業務 route の冒頭から呼ぶ（既存の `getCurrentClaims()` 呼び出しと差し替え or 追加）。**認証 API（`auth/login` / `auth/refresh`）はゲート対象外**（未ログイン/失効状態で叩くため）。
2. `middleware.ts`: **`/api` は matcher 除外を維持**（触らない＝認証 API を壊さない）。token 検証成功時に `claims.mustChangePassword` が真かつ `pathname !== "/change-password"` なら `/change-password` へリダイレクト（`/login`・`/change-password` は素通し）。これはページ UX 誘導であり、セキュリティ境界は Step 4-1 の API ゲート。
- 【検証】フラグ持ちユーザーが (a) 保護ページ→`/change-password` に飛ぶ、(b) `/api/v1/users` 等を直接叩く→403、(c) `/change-password` と change-password API は通る、(d) **未ログインで `/api/v1/auth/login`、access 失効 + refresh cookie ありで `/api/v1/auth/refresh` が route に届く（`/login` リダイレクトされない・JSON が返る）**。ループ無し。

### Step 5 — B: change-password API + UI
1. `POST /api/v1/auth/change-password`:
   - IP レートリミット（`rateLimit` 流用）→ `getCurrentClaims()` で認証必須（未認証 401）。body は valibot で `{ currentPassword: min 1, newPassword: min 12 }`。
   - **`claims.email` 欠落時**（型上 optional）は 401（再ログイン誘導）。current PW 確認に email が要るため、欠落トークンは異常系として弾く。
   - **current PW 確認**: `gotrue.signInWithPassword(claims.email, currentPassword)`。失敗なら 401（汎用メッセージ）。
   - PW 更新 + フラグ解除: `gotrue.admin.updateUser(claims.sub, { password:newPassword, appMetadata: mustChangeAppMetadata(false) })`。**この時点で変更は確定**。
   - `gotrue.signInWithPassword(claims.email, newPassword)` の **戻り session（access+refresh）を `setSession`** に渡しフラグ無しの新世代へ差し替え。**この再ログイン/setSession は best-effort**（失敗しても「変更完了。再ログインしてください」を返す＝PW が変わったのに失敗扱いで詰むのを防ぐ）。
   - 成功・失敗とも new/current PW を含めない汎用メッセージ。`console.error` に GoTrue レスポンスボディを丸ごと出さない。
2. `app/change-password/page.tsx`: `@waoon/ui`（ContentBlock + FormField + FormActions）で 現 PW + 新 PW + 確認入力（new == confirm は UI 側検証）→ API 呼び出し → 成功で `/` へ。
- 【検証】新規ユーザー初回ログイン → `/change-password` 強制 → 現 PW + 新 PW で変更 → 通常画面へ進め、再ログインでも飛ばされない。current PW 不一致は 401。

---

## 6. 検証（受け入れ基準）

- `pnpm typecheck` / `pnpm lint` green。
- **A-1**: admin が email 変更 → 新 email でログイン成功、旧 email では失敗。
- **A-2**: email 重複時は 409（GoTrue 既存 email・DB unique violation の両ケース）。GoTrue 更新後の DB 失敗で email が旧値へ巻き戻る（unique 制約違反を狙って誘発、または手順で説明）。**ロールバックも失敗した最悪ケース（DB=旧・ログイン=新）は要手動修復**である旨をリスク表に記載済み。
- **A-3**: admin の PW リセットで生成 PW が一度だけ返り、その PW でログインできる。
- **B-0（最重要ゲート）**: 新規作成ユーザーの access token に `app_metadata.must_change_password=true` が載る。**載らなければ DB カラム方式へ切替**（判断 #2）。
- **B-1**: reset 実行後、対象ユーザーが refresh / 再ログインすると新 access token（または DB カラム）にフラグが反映される。
- **B-2（ページ）**: フラグ持ちユーザーは保護ページから `/change-password` へ強制リダイレクト（ループ無し）。
- **B-3（API）**: フラグ持ちトークンで `/api/v1/users` 等の非 allowlist API を直接叩くと **403**。allowlist（change-password / logout / me）は通る。
- **B-3b（認証 API 非破壊）**: 未ログインで `/api/v1/auth/login`、access 失効 + refresh cookie ありで `/api/v1/auth/refresh` が route に届く（middleware が `/api` を触らないため `/login` リダイレクトされない・JSON が返る）。
- **B-4**: change-password は current PW 必須（不一致は 401）。変更完了後はフラグが消え通常画面へ進め、再ログインでも強制されない。
- **B-5**: PW リセットされたユーザーも次回ログインで force-change が掛かる。

---

## 7. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| GoTrue access token に `app_metadata` が載らない | claim 方式の B が成立しない | Step 3-B0 を **初手の検証ゲート**にし、載らなければ判断 #2 のフォールバック（`public.users` カラム + レイアウト/API 判定）へ切替。~~毎回 admin getUser~~ は Edge で破綻するため不採用 |
| force-change が API を素通り | 認証バイパス（フラグ持ちで全機能利用） | 判断 #6: **API 層ゲート単独**で非 allowlist を 403。middleware はページのみ（`/api` 除外維持）。Step 4 B-3 で 403、B-3b で認証 API 非破壊を確認 |
| change-password の current PW 欠落 | セッション奪取でアカウント乗っ取り | 判断 #7: current PW 必須。B-4 で 401 を確認 |
| email 同期の two-write 不整合（GoTrue 成功・DB 失敗） | DB とログイン email がズレる | 判断 #4 の順序 + best-effort ロールバック。**ロールバックも失敗した三重障害時は「DB=旧 email・ログイン=新 email」が確定的に残り要手動修復**（gotrue_id を error ログに残す）。発生頻度は低いが運用で拾える |
| reset 後も旧 access token が失効まで有効 | 最大 `expires_in` 秒はフラグ無しで API を叩ける | 仕様として許容（猶予は短時間）。必要なら将来 reset 時に既存セッション失効を検討（後続課題） |
| change-password の解除前トークン残留 / 旧 refresh 復活 | 変更後も飛ばされ続ける | 解除 → 新 PW 再ログイン → **access+refresh 両方を setSession**（判断 #5） |
| service_role JWT の濫用面拡大 | 認可バイパス | 既存 `mintServiceRoleToken`（60s 使い捨て・サーバ内のみ・外部非露出）を踏襲。client へ渡す新経路は作らない。change-password に IP レートリミット（判断 #8） |
| 既存ユーザー（フラグ無し）が変更を強制されない | 仕様（遡及しない） | 強制したい既存ユーザーは admin が reset を実行すればフラグが付く。一括強制は §残課題（reset ロジック再利用で bulk 化可能） |

---

## 8. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-14 | 親 Plan「認証の残」の A+B を本 Plan に切り出し（C: エッジ/Redis レートリミットは #24 で nginx 一次済み・分散は非ゴールのため対象外） | スコープ確認（笹木さん）で A+B を選択 |
| 2026-06-14 | フラグは `app_metadata`（service_role 専用）に置く | ユーザー自己改ざん不可。`user_metadata` は self-PUT で書ける抜け道がある |
| 2026-06-14 | PW リセットは PUT に混ぜず専用 `reset-password` エンドポイント | 「生成 PW を一度だけ返す」契約を汎用 update と分離 |
| 2026-06-14 | email 同期は GoTrue→DB 順 + DB 失敗時 best-effort ロールバック | ログイン真実源を GoTrue に倒す。「DB だけ新 email」を避ける |
| 2026-06-15 | 計画レビュー（code/security/architect 並列）**NEEDS WORK** を反映 | BLOCKER: ①force-change が API 素通り→**API 層ゲート + middleware を /api までカバー**（判断 #6）②claim フォールバック「毎回 admin getUser」が Edge で破綻→**DB カラム方式**へ（判断 #2）③current PW 欠落で乗っ取り→**必須化**（判断 #7）④refresh 差し替え明示（判断 #5）⑤change-password レートリミット**入れる**（判断 #8）⑥DB unique→409 検証追加。NICE: metadata.ts 必須化・tx 境界・三重障害手動修復・一括 force-change 残課題 |
| 2026-06-15 | 再計画レビュー（Codex）**NEEDS WORK** を反映: **middleware を /api まで広げる案を撤回**。enforcement は **API 層ゲート単独**、middleware はページ専用のまま（`/api` 除外維持）（判断 #6 改訂・Step 4・§6 B-3b） | Codex BLOCKER: `/api` を matcher に含めると未ログインの `auth/login` と refresh cookie だけの `auth/refresh` が `/login` リダイレクトで route に届かず認証 API が壊れる。元の B-1 は「認可は API 層が主」なので API ゲートだけで足り、middleware の /api 介入は不要だった。あわせて NICE（`claims.email` 欠落時 401）を Step 5 に反映 |
| 2026-06-15 | コードレビュー（Codex）**NEEDS WORK** を反映: PUT `/users/[id]` の **GoTrue 更新前に admin ゲートを追加** | Codex BLOCKER: `users_select` は認証済み全員可のため、admin ゲート無しだと非 admin が対象の gotrue_id/email を読み、service_role 経由で GoTrue email 更新を発火できた（DB は RLS で 0 行→ロールバックだが外部副作用＋乖離リスク）。POST/reset-password と同じく外部 I/O 前に `app.is_admin()` を必須化。NICE: reset-password の 404/409 分離も反映 |

---

## 9. 残課題（計画レビュー NICE-TO-HAVE / 後続）

- **既存ユーザーの一括 force-change**: 移行直後に全員へ強制したくなったら、`reset-password` の「`updateUser` で `appMetadata(true)`（または DB カラム true）」を provision スクリプトに bulk 適用で拡張する。
- **reset 時の既存セッション失効**: reset しても対象の旧 access token は失効まで有効。即時失効が要るなら GoTrue セッション revoke を検討。
- **任意セルフ PW 変更の導線**: `/change-password` はメニュー等の導線磨き込みは後続。
- **API ゲートの高階ラッパ化（別 refactor PR）**: 現状は各業務ルートに `getCurrentClaims` + `forceChangeGuard` を直書き（20 ルート）。新規ルートでの**書き忘れ＝認可漏れ**を構造的に防ぐため、claims をラッパ経由でのみ得られる形（`withActiveUser(handler)` ＝業務用 / `withUser(handler)` ＝401 のみの allowlist 用）へ抽出する。純粋な機械的リファクタなので独立 PR で出し、再コードレビューを軽く通す。継承ではなく関数合成で行う（route handler は関数）。

---

## 10. ステータス

- [x] Plan ドラフト完成（本ファイル）
- [x] **計画レビュー（レビュアー Agent 3 視点並列）** → [NEEDS WORK](../reviews/2026-06-15-0930-auth-gotrue-sync-force-change-review.md)
- [x] 指摘反映（判断 #2/#5/#6/#7/#8 追加・改訂、§2 スコープ、§5 Step、§6 検証、§7 リスク）
- [x] **再計画レビュー（Codex）** → [NEEDS WORK](../reviews/2026-06-15-0930-auth-gotrue-sync-force-change-replan-review.md)（middleware /api 撤回）
- [x] 指摘反映（判断 #6 改訂で middleware /api を撤回・API ゲート単独へ、Step 4 / §6 B-3b、Step 5 `claims.email` 欠落時 401）
- [x] **再々計画レビュー（Codex）** → [APPROVE](../reviews/2026-06-15-0945-auth-gotrue-sync-force-change-replan-review-v2.md)（NICE: §7 文言ズレを即修正済み）
- [x] 笹木さん承認
- [x] Step 1（client 拡張）→ Step 5（change-password UI）実装（feature/auth-gotrue-sync-force-change）
- [x] 実装: Step 1〜5（admin client / metadata / email 同期 / reset-password / force-change ゲート / change-password）
- [x] 静的検証: `pnpm typecheck` green / `next build` green（`pnpm lint` は未設定プレースホルダ）
- [x] **コードレビュー（Codex）** → [NEEDS WORK](../reviews/2026-06-15-1015-auth-gotrue-sync-force-change-code-review.md)（PUT の admin ゲート欠落）
- [x] 指摘反映（PUT に admin ゲート追加、reset-password 404/409 分離）
- [x] **再コードレビュー（Codex）** → [APPROVE](../reviews/2026-06-15-1030-auth-gotrue-sync-force-change-code-review-v2.md)（残 NICE は B-0 runtime のみ）
- [x] commit（2 本: feat / docs）→ push → **PR 作成（[#25](https://github.com/sasakiyusuke2017015/waoon/pull/25)）**
- [x] 笹木さんマージ承認 → **merge 済み（#25, develop）**
- [x] **マージ後（受け入れ）検証**（2026-06-23・dev スタック / API 経由。使い捨てユーザ verify1 で実施し終了後に GoTrue + `public.users` から削除）
  - [x] **B-0**: 新規作成ユーザーの access token に `app_metadata.must_change_password=true` が載る（claim 方式が成立＝判断 #2 のピボット不要。`lib/auth/jwt.ts` は JWT の `app_metadata` のみを読むため、下記 force-change 403 が出た時点で claim 搭載が実証されている）
  - [x] A-1: admin が email 変更（PUT `/v1/users/[id]`）→ 新 email でログイン 200・旧 email 401
  - [x] A-3: PW リセット（POST `/v1/users/[id]/reset-password`）で生成 PW が応答 `initialPassword` に一度だけ返り（再取得不可）その PW でログイン可・`must_change=true` 再設定
  - [x] B-2/B-3: フラグ持ちは非 allowlist API が 403（`/v1/surveys`・`/v1/dashboard`）・認証 API と `/change-password` は素通し。**ページ誘導（middleware の `/change-password` リダイレクト）はブラウザ未実施**で、API 層ゲートの 403 で代替確認
  - [x] B-4: current PW 必須（誤った現 PW は 401）、正しい現 PW で 200・`must_change=false`・業務 API 200
