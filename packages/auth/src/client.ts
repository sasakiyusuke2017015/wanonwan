import type {
  CreateUserInput,
  GoTrueClient,
  GoTrueClientOptions,
  GoTrueSession,
  GoTrueUser,
} from "./types";

export class GoTrueError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "GoTrueError";
  }
}

type Json = Record<string, unknown> | undefined;

async function gotrueFetch(url: string, init: RequestInit): Promise<Json> {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const b = body as Record<string, unknown> | undefined;
    const message =
      (b &&
        ((b.msg as string) ||
          (b.error_description as string) ||
          (b.error as string) ||
          (b.message as string))) ||
      `GoTrue request failed (${res.status})`;
    throw new GoTrueError(message, res.status, body);
  }
  return body as Json;
}

const jsonHeaders = { "content-type": "application/json" } as const;

export function createGoTrueClient(options: GoTrueClientOptions): GoTrueClient {
  const base = options.url.replace(/\/$/, "");

  return {
    async signInWithPassword(email, password) {
      return (await gotrueFetch(`${base}/token?grant_type=password`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ email, password }),
      })) as unknown as GoTrueSession;
    },

    async refresh(refreshToken) {
      return (await gotrueFetch(`${base}/token?grant_type=refresh_token`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ refresh_token: refreshToken }),
      })) as unknown as GoTrueSession;
    },

    async signOut(accessToken) {
      await gotrueFetch(`${base}/logout`, {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}` },
      });
    },

    async getUser(accessToken) {
      return (await gotrueFetch(`${base}/user`, {
        headers: { authorization: `Bearer ${accessToken}` },
      })) as unknown as GoTrueUser;
    },

    async recover(email) {
      await gotrueFetch(`${base}/recover`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ email }),
      });
    },

    admin: {
      async createUser(input: CreateUserInput, serviceRoleToken: string) {
        return (await gotrueFetch(`${base}/admin/users`, {
          method: "POST",
          headers: { ...jsonHeaders, authorization: `Bearer ${serviceRoleToken}` },
          body: JSON.stringify({
            email: input.email,
            password: input.password,
            email_confirm: input.emailConfirm ?? true,
            user_metadata: input.userMetadata,
          }),
        })) as unknown as GoTrueUser;
      },
    },
  };
}
