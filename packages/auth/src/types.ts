// GoTrue が返す最小限の型（必要分のみ。SDK は使わず自前で定義）。

export interface GoTrueUser {
  id: string;
  email?: string;
  role?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface GoTrueSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: GoTrueUser;
}

export interface CreateUserInput {
  email: string;
  password: string;
  /** 既定で email 確認済みにする（管理者発行のため） */
  emailConfirm?: boolean;
  userMetadata?: Record<string, unknown>;
  /** service_role のみ設定可能なメタデータ（force-change フラグ等）。 */
  appMetadata?: Record<string, unknown>;
}

/** 管理 API で更新する属性。指定したものだけ送る（undefined は触らない）。 */
export interface UpdateUserAttributes {
  email?: string;
  password?: string;
  /** email を即確認済みにする（admin 操作で確認メールを挟まないため）。 */
  emailConfirm?: boolean;
  userMetadata?: Record<string, unknown>;
  /** service_role のみ設定可能。 */
  appMetadata?: Record<string, unknown>;
}

export interface GoTrueClientOptions {
  /** GoTrue のベース URL（例: http://localhost:9999） */
  url: string;
}

export interface GoTrueClient {
  signInWithPassword(email: string, password: string): Promise<GoTrueSession>;
  refresh(refreshToken: string): Promise<GoTrueSession>;
  signOut(accessToken: string): Promise<void>;
  getUser(accessToken: string): Promise<GoTrueUser>;
  recover(email: string): Promise<void>;
  admin: {
    /** service_role JWT が必要 */
    createUser(input: CreateUserInput, serviceRoleToken: string): Promise<GoTrueUser>;
    /** service_role JWT が必要。email / password / メタデータの更新に使う。 */
    updateUser(
      id: string,
      attrs: UpdateUserAttributes,
      serviceRoleToken: string,
    ): Promise<GoTrueUser>;
    /** service_role JWT が必要。provisioning 失敗時のロールバック（orphan 掃除）に使う。 */
    deleteUser(id: string, serviceRoleToken: string): Promise<void>;
  };
}
