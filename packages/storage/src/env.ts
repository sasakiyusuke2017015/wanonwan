import * as v from "valibot";

// `v.url()` は `new URL()` 準拠のため "localhost:9000" のようなスキーム無しも通ってしまう
// （protocol="localhost:" として解釈される）。S3 endpoint として使えるのは http(s) のみ。
const Url = v.pipe(v.string(), v.url(), v.regex(/^https?:\/\//));
const NonEmpty = v.pipe(v.string(), v.minLength(1));

export const StorageEnvSchema = v.object({
  // presigned URL の署名先。ブラウザが直接叩くため browser-reachable なホストである必要がある
  // （dev は http://localhost:9000、stg/prod は nginx 経由の storage サブドメイン）。
  STORAGE_ENDPOINT: Url,
  // server 側から S3 API を実通信する用途（HeadObject / DeleteObject）の endpoint。
  // 未指定なら STORAGE_ENDPOINT にフォールバックする。compose 内では minio へ直結させ、
  // 内部通信が公開ホスト（nginx）を往復しないようにする。
  STORAGE_INTERNAL_ENDPOINT: v.optional(Url),
  STORAGE_REGION: v.optional(NonEmpty, "us-east-1"),
  STORAGE_ACCESS_KEY: NonEmpty,
  STORAGE_SECRET_KEY: NonEmpty,
  STORAGE_BUCKET: v.optional(NonEmpty, "wanonwan"),
});

export type StorageEnv = v.InferOutput<typeof StorageEnvSchema>;

// env を検証して返す。認証情報に既定値は用意せず、欠落・空文字はここで落とす
// （既定値で「動いてしまう」と、本番で誤った資格情報のまま稼働する事故になる）。
export function parseStorageEnv(
  source: Record<string, string | undefined> = process.env,
): StorageEnv {
  const result = v.safeParse(StorageEnvSchema, source);
  if (result.success) return result.output;
  const keys = [...new Set(result.issues.map((i) => String(i.path?.[0]?.key ?? "?")))];
  throw new Error(`ストレージ設定 (env) が不正です: ${keys.join(", ")}`);
}
