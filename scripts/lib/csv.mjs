// seed / 人員 CSV の読み込みと、roles 列の検証。
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { die } from "./cli.mjs";

export function readCsv(path) {
  return parse(readFileSync(path, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

// CSV の roles 列（セミコロン区切り）を検証して配列へ。上位ロールのみ記載し、空 = member のみ
// （member は暗黙保有のため CSV には書かない規約）。DB CHECK の手前で typo を分かりやすく弾く。
const ELEVATED_ROLES = new Set(["admin", "interviewer"]);

export function parseRoles(raw, label) {
  const roles = (raw ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const role of roles) {
    if (!ELEVATED_ROLES.has(role)) {
      die(`${label} の roles が不正です: ${JSON.stringify(role)}（admin / interviewer のみ）`);
    }
  }
  return roles;
}
