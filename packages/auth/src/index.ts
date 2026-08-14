// @wanonwan/auth — GoTrue HTTP API への薄いラッパ（SDK 不使用、fetch 直叩き）。
export { createGoTrueClient, GoTrueError } from "./client";
export type {
  CreateUserInput,
  GoTrueClient,
  GoTrueClientOptions,
  GoTrueSession,
  GoTrueUser,
  UpdateUserAttributes,
} from "./types";
