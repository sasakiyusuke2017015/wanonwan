import "server-only";

// 自前ホスト埋め込み（HuggingFace text-embeddings-inference）。データを社外に出さない。
// EMBEDDINGS_URL 未設定なら無効（RAG メンター提案は 503）。
const EMBEDDINGS_URL = process.env.EMBEDDINGS_URL;

export const embeddingsEnabled = Boolean(EMBEDDINGS_URL && EMBEDDINGS_URL.trim());

// e5 系モデルは "query: " / "passage: " prefix で精度が上がる（検索クエリ / 保存文書）。
export function buildEmbedInput(text: string, kind: "query" | "passage"): string {
  return `${kind}: ${text}`;
}

// TEI /embed は number[][]（入力ごとのベクトル配列）を返す。先頭を取り出す。
export function parseEmbedding(json: unknown): number[] {
  if (Array.isArray(json) && Array.isArray(json[0])) return json[0] as number[];
  throw new Error("unexpected embedding response shape");
}

// number[] を pgvector のテキストリテラル "[a,b,c]" に整形（::vector でキャストして使う）。
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

// テキストを埋め込みベクトルにする（外部送信は社内の embeddings コンテナのみ）。
export async function embed(text: string, kind: "query" | "passage"): Promise<number[]> {
  const res = await fetch(`${EMBEDDINGS_URL}/embed`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ inputs: buildEmbedInput(text, kind) }),
  });
  if (!res.ok) throw new Error(`embeddings request failed: ${res.status}`);
  return parseEmbedding(await res.json());
}
