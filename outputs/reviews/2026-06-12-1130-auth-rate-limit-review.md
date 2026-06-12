# セキュリティレビュー: 認証エンドポイントのレートリミット

- **対象ブランチ**: `feature/auth-rate-limit`（develop 比、未コミット作業ツリー）
- **対象 Plan**: [outputs/plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)
- **レビュー日**: 2026-06-12
- **レビュアー**: security-reviewer agent
- **slug**: auth-rate-limit

## 対象ファイル

| ファイル | 種別 | 概要 |
|---|---|---|
| `apps/web/lib/auth/rate-limit.ts` | 新規 | プロセス内メモリ・固定ウィンドウのレートリミッタ |
| `apps/web/app/api/v1/auth/login/route.ts` | 変更 | POST 冒頭で IP 単位レートリミット |
| `apps/web/app/api/v1/auth/refresh/route.ts` | 変更 | `POST()` → `POST(req)`、IP 単位レートリミット |
| `.claude/settings.json` | 変更 | Bash 許可リスト追記のみ（コードと無関係・無害） |

## サマリ

- **Critical**: 0
- **High**: 0
- **Medium**: 2（いずれも後続課題として既知、本ブランチでは非ブロッキング）
- **Low / Nice-to-have**: 4
- **リスクレベル**: 🟢 LOW
- **BLOCKER**: なし

レートリミットは login / refresh の双方で **認証処理より前に正しく短絡** しており、
正常系・エラー系のレスポンス契約は develop と同一で regression なし。typecheck 通過。
設計判断（IP 単位のみ採用、プロセス内メモリ＝多層防御の位置づけ）はコメントと整合し、
脅威モデルとして妥当。本番は nginx/Redis が本命という前置きも明記されている。

---

## 重点観点ごとの評価

### 1. レートリミットの実効性 ✅（指摘 1 件: 境界バースト）

- login（既定 10/分）/ refresh（既定 30/分）とも POST 冒頭で評価し、`!ok` で即 429。
  認証処理（`gotrue.signInWithPassword` / `gotrue.refresh`）の手前で短絡しているため、
  超過リクエストが GoTrue に到達しない。意図どおり。
- login は成功・失敗とも 1 リクエスト = 1 カウントで計上。ブルートフォース緩和として正しい
  （成功時のみ除外すると無意味になる）。
- **固定ウィンドウのバースト** は構造的に残る（[MEDIUM-1]）。ウィンドウ境界をまたぐと
  最大 `2 * limit` を約 1 秒以内に通せる（前ウィンドウ末で limit、直後の新ウィンドウ頭で limit）。
  既知の固定ウィンドウの性質で、本実装の脅威モデル（アプリ層の多層防御）では許容範囲。
  スライディングウィンドウ/トークンバケットは Redis 化時に検討。

### 2. IP 詐称（X-Forwarded-For） ⚠️（指摘 2 件、いずれも後続前提で非ブロッキング）

- 現状 nginx 未設置のため、`getClientIp` は **クライアントが自由に詐称できる XFF を信頼** する。
  攻撃者は XFF を毎回変えて鍵を無限に分散でき、IP 単位レートリミットは実質バイパス可能（[MEDIUM-2]）。
  これはレビュー依頼の落とし所どおり「nginx 配下で実 IP を渡す前提」で **NICE-TO-HAVE 扱い**。
  ただし **本番投入の前提条件** として下記を満たすことを必須とする:
  - nginx 等の trusted proxy が **クライアント由来の XFF を上書き**（`proxy_set_header X-Forwarded-For $remote_addr` 等）し、アプリは信頼境界の内側でのみ XFF を解釈する。
  - アプリが直接インターネットに露出する構成（trusted proxy なし）では、本レートリミッタは
    「無いより少しマシ」程度で、防御として数えない。コメントにこの前提が書かれているのは良い。
- XFF の先頭要素採用は trusted proxy 前提なら妥当。詐称対策の本筋は「末尾から trusted hop 数を
  数える」だが、それは proxy 構成確定後の話。現段階では先頭採用で可（[NICE-3]）。

### 3. DoS / メモリ ✅（指摘 1 件: "unknown" 集約）

- バケット Map の鍵は攻撃者制御の IP 文字列になりうるが、`sweep` が 60 秒ごとに期限切れバケットを
  削除する。ウィンドウ 60 秒・sweep 間隔 60 秒なので、各鍵は最大でも約 2 ウィンドウ分しか滞留せず、
  無制限肥大はしない。詐称 XFF で鍵を量産されても、観測ウィンドウ内の同時ユニーク IP 数に比例した
  上限に収まる。実用上のメモリ枯渇リスクは低い。
- ただし sweep は **次の `rateLimit` 呼び出し時にしか走らない**（リクエスト駆動）。リクエストが
  完全に止まれば古いバケットは残るが、無害（次リクエスト時に掃除される）。タイマー不使用は
  サーバーレス/HMR でのリーク回避になり、むしろ妥当。
- **"unknown" 集約** ([LOW-1]): XFF も X-Real-IP も無い全リクエストが単一鍵 `*:ip:unknown` に
  集約される。nginx 配下では実 IP が必ず付くので実害は小さいが、proxy 設定漏れ時に全ユーザーが
  1 つのバケットを共有し相互に 429 を誘発しうる。proxy 前提が崩れた場合の **fail-open ではなく
  巻き添え DoS** になる点は運用ノートに残す価値あり。

### 4. 情報漏洩 / UX / enumeration ✅

- 429 ボディは汎用日本語メッセージのみ。アカウント存在有無を漏らさない。
- `Retry-After` は `Math.max(1, ceil(...))` で常に正の秒数。妥当。
- レートリミットは email を見ずに IP のみで判定するため、**enumeration オラクルにならない**
  （存在するメール/しないメールで 429 挙動が変わらない）。実機検証の「refresh 初回は 401（429 でない）」
  とも整合（refresh は 1 回目はまだ閾値未満）。
- login の認証失敗は従来どおり 401 の汎用メッセージで、レートリミット追加による情報差分なし。

### 5. fail-open / closed ✅

- `rateLimit` は同期・例外を投げない純粋計算（Map 操作と算術のみ）で、リミッタ自体が認証経路を
  巻き込んで落とすことはない。
- リミッタ通過後は従来の try/catch がそのまま機能。GoTrue 例外・JSON parse 失敗・想定外例外の
  3 分岐は develop と同一。レートリミット導入で例外ハンドリングが弱まっていない。
- 「fail-open（リミッタ無効化）」も「fail-closed（全 429）」も発生しない設計。妥当。

### 6. 既存挙動の不変性 ✅（regression なし）

- `git show develop:...` と現作業ツリーを突き合わせ、login は **先頭にレートリミット 3 行を挿入した
  だけ**。バリデーション（valibot）、成功レスポンス、GoTrue 401/502 分岐、500 フォールバックは完全同一。
- refresh は `POST()` → `POST(req: Request)` のシグネチャ変更 + 先頭レートリミットのみ。
  リフレッシュトークン取得・成功・`clearSession` を伴う失敗系は同一。
- middleware は `matcher` で `/api` を除外しており、auth ルートは自前防御。レートリミットを
  ルート内に置く配置は正しい（middleware に置くと edge runtime でモジュール状態が共有されない）。
- `pnpm --filter @waoon/web typecheck` 通過。実機検証（200→401×2→429+Retry-After:60、
  refresh 初回 401、サーバエラーなし）とも一致。

---

## 指摘一覧

### [NICE-TO-HAVE] MEDIUM-1: 固定ウィンドウの境界バースト
ウィンドウ境界で最大 `2 * limit` を瞬間的に通せる。固定ウィンドウ既知の性質で、現脅威モデルでは
許容。Redis 化時にスライディングウィンドウ/トークンバケットへ寄せる候補として Plan の残課題へ。

### [NICE-TO-HAVE] MEDIUM-2: XFF 詐称による鍵分散バイパス（本番前提条件あり）
nginx 未配置の現状では XFF 詐称で IP 単位制限を回避可能。**本番投入の前提**として
「trusted proxy がクライアント XFF を上書き／実 IP を注入する」ことを満たすこと。
直接露出構成では本リミッタを防御として数えない（コメントに前提記載済み・落とし所どおり非ブロッカー）。

### [NICE-TO-HAVE] LOW-1: "unknown" 集約による巻き添え 429
IP 取得失敗時に全リクエストが単一鍵へ集約。proxy 設定漏れ時に相互 429 を誘発しうる。
運用ノート／監視で proxy 由来ヘッダの存在を担保する。

### [NICE-TO-HAVE] NICE-3: XFF の hop 数解釈
将来 trusted proxy 構成確定後、先頭採用ではなく「末尾から trusted hop 数」で実 IP を取る方式に寄せる。

### [NICE-TO-HAVE] NICE-4: env 値の運用可観測性
`positiveIntEnv` は不正値（0・負・非整数）を黙って既定にフォールバックする。誤設定時に気付けるよう、
起動時に解決後の制限値を 1 行ログ出力すると運用で安全（秘密情報ではないので可）。

### [NICE-TO-HAVE] NICE-5: 429 時のヘッダ拡充
`Retry-After` に加え `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset`（draft 標準）を
返すとクライアント実装が楽になる。任意。

---

## セキュリティチェックリスト

- [x] ハードコードされた秘密情報がない（env 経由・既定値は閾値のみ）
- [x] 入力バリデーションが維持（login は valibot 継続）
- [x] SQL/NoSQL/Command Injection 該当なし（DB クエリ不変）
- [x] XSS 該当なし（JSON レスポンスのみ、innerHTML 等なし）
- [x] 認証必須経路の挙動不変
- [x] レートリミットが認証の前段で短絡
- [x] ログに機密情報を出していない（追加ログなし）
- [x] エラーメッセージが汎用（enumeration オラクルなし）
- [x] fail-open/closed が発生しない
- [x] typecheck 通過・regression なし
- [ ] 分散攻撃 / credential stuffing 対策（captcha 等）— 後続課題（本ブランチ範囲外）
- [ ] エッジ/Redis での本命レートリミット — 後続課題（Plan §4）

## 推奨事項（後続）

1. nginx 配下で **クライアント XFF を上書き**する proxy 設定を本番前提として明文化（MEDIUM-2 の前提）。
2. Plan の残課題に「固定ウィンドウ→スライディング/トークンバケット」「per-email + captcha で
   分散/credential stuffing」「Redis 集中管理（多重インスタンス対応）」を残す。
3. 監視: 429 発生率と "unknown" 鍵のヒット率をメトリクス化（proxy 設定漏れの早期検知）。

---

## verdict

**APPROVE**
