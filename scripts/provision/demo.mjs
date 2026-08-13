// demo ステップ: 画面確認用のデモデータ（デモ回答者 + アンケート / 設問 / 掲載 / 回答 / スケジュール）。
//
// 冪等判定は **ステップ単位の番兵行**（`users.code = 'demo01'`）。テーブル単位の rowCount では、
// surveys / answers を共有する fixture ステップが先に流れた DB で demo が誤スキップされる。
//
// 投入は**単一トランザクション**で行う。部分失敗で番兵行だけが残ると、再実行が誤スキップして
// 中途半端な状態が固定されてしまうため。
import { join } from "node:path";
import { root } from "../lib/cli.mjs";
import { readCsv } from "../lib/csv.mjs";
import {
  intLiteral,
  intOrNull,
  jsonbStringArray,
  refByValue,
  refSubquery,
  sqlInList,
  sqlStr,
  sqlValOrNull,
  tsOrNull,
} from "../lib/psql.mjs";

const demoDir = join(root, "packages", "db", "seed", "demo");
const SENTINEL_CODE = "demo01";

// 評価 jsonb（満足度/業務負荷/職場環境/人間関係/ストレス）。全列空なら NULL。
function evalJson(r) {
  const keys = ["satisfaction", "workload", "environment", "relationship", "stress"];
  const present = keys.filter((k) => r[k] !== undefined && r[k] !== "");
  if (present.length === 0) return "NULL";
  const pairs = present.map((k) => `'${k}', ${intLiteral(r[k], `answers.${k}`)}`).join(", ");
  return `jsonb_build_object(${pairs})`;
}

// CSV 1 ファイル分の INSERT 文を組み立てる。
function inserts(table, columns, build, suffix = "") {
  return readCsv(join(demoDir, `${table}.csv`))
    .map((r) => `INSERT INTO public.${table} (${columns.join(", ")}) VALUES (${build(r).join(", ")})${suffix};`)
    .join("\n");
}

function buildSql() {
  const parts = [
    // デモ回答者（gotrue_id NULL = ログイン不可の表示用レコード）。
    readCsv(join(demoDir, "demo_users.csv"))
      .map(
        (r) =>
          `INSERT INTO public.users (code, name, email, position_id, section_id) VALUES (${[
            sqlStr(r.code),
            sqlStr(r.name),
            sqlStr(r.email),
            refSubquery("positions", r.position_code),
            refSubquery("sections", r.section_code),
          ].join(", ")}) ON CONFLICT (email) DO NOTHING;`,
      )
      .join("\n"),

    inserts("surveys", ["title", "status"], (r) => [sqlStr(r.title), sqlStr(r.status || "draft")]),

    inserts(
      "questions",
      ["body", "answer_type", "choices", "eval_item", "required", "sort_order"],
      (r) => [
        sqlStr(r.body),
        sqlStr(r.answer_type),
        jsonbStringArray((r.choices ?? "").split("|").map((s) => s.trim()).filter(Boolean)),
        sqlValOrNull(r.eval_item),
        r.required === "true" ? "true" : "false",
        intLiteral(r.sort_order || "0", "questions.sort_order"),
      ],
    ),

    inserts("survey_questions", ["survey_id", "question_id", "sort_order"], (r) => [
      refByValue("surveys", "title", r.survey_title),
      refByValue("questions", "body", r.question_body),
      intLiteral(r.sort_order || "0", "survey_questions.sort_order"),
    ]),

    inserts(
      "survey_publications",
      ["survey_id", "title", "body", "status", "start_at", "end_at"],
      (r) => [
        refByValue("surveys", "title", r.survey_title),
        sqlStr(r.title),
        sqlValOrNull(r.body),
        intLiteral(r.status || "100", "publications.status"),
        tsOrNull(r.start_at),
        tsOrNull(r.end_at),
      ],
    ),

    inserts(
      "answers",
      [
        "publication_id", "respondent_id", "status", "evaluation", "health_status",
        "answered_at", "interview_at", "interview_method", "interviewer_id",
        "interview_memo", "next_action",
      ],
      (r) => [
        refByValue("survey_publications", "title", r.publication_title),
        refSubquery("users", r.respondent_code),
        intLiteral(r.status || "100", "answers.status"),
        evalJson(r),
        intOrNull(r.health_status, "answers.health_status"),
        tsOrNull(r.answered_at),
        tsOrNull(r.interview_at),
        intOrNull(r.interview_method, "answers.interview_method"),
        r.interviewer_code ? refSubquery("users", r.interviewer_code) : "NULL",
        sqlValOrNull(r.interview_memo),
        sqlValOrNull(r.next_action),
      ],
    ),

    inserts(
      "schedules",
      ["title", "body", "start_at", "end_at", "event_type", "color", "created_by"],
      (r) => [
        sqlStr(r.title),
        sqlValOrNull(r.body),
        tsOrNull(r.start_at),
        tsOrNull(r.end_at),
        sqlValOrNull(r.event_type),
        sqlValOrNull(r.color),
        r.created_by_code ? refSubquery("users", r.created_by_code) : "NULL",
      ],
    ),
  ];
  return `BEGIN;\n${parts.join("\n")}\nCOMMIT;\n`;
}

export function provision({ psql }) {
  const exists = psql(
    `SELECT count(*) FROM public.users WHERE code = ${sqlStr(SENTINEL_CODE)};`,
    { capture: true },
  ).trim();
  if (exists !== "0") {
    console.log(`• demo: 番兵行（users.code=${SENTINEL_CODE}）が存在 → スキップ`);
    return 0;
  }
  psql(buildSql());
  console.log("• demo: デモデータを投入（単一トランザクション）");
  return 1;
}

// seed 由来の行。配列順 = 削除順（FK 依存の逆順）。
// answers / schedules は自然キーを持たないため、demo 回答者に紐づく行として特定する。
//
// survey_questions は surveys / questions への CASCADE FK を持つ。**demo 自身の junction 行**を
// 削除計画に明示することで、巻き添え削除を意図的なものとして扱う。両端とも demo の行だけを
// 対象にするため、demo 設問を画面で作った別アンケートに紐付けた行は残り、非 seed 参照チェックが
// 正しく検出する。
export function seedSets() {
  const col = (file, field) => readCsv(join(demoDir, `${file}.csv`)).map((r) => r[field]);
  const demoUserIds = `(SELECT id FROM public.users WHERE code IN ${sqlInList(col("demo_users", "code"))})`;
  const demoSurveyIds = `(SELECT id FROM public.surveys WHERE title IN ${sqlInList(col("surveys", "title"))})`;
  const demoQuestionIds = `(SELECT id FROM public.questions WHERE body IN ${sqlInList(col("questions", "body"))})`;
  return [
    { table: "schedules", where: `created_by IN ${demoUserIds}` },
    { table: "answers", where: `respondent_id IN ${demoUserIds}` },
    {
      table: "survey_questions",
      where: `survey_id IN ${demoSurveyIds} AND question_id IN ${demoQuestionIds}`,
    },
    { table: "survey_publications", where: `title IN ${sqlInList(col("survey_publications", "title"))}` },
    { table: "surveys", where: `title IN ${sqlInList(col("surveys", "title"))}` },
    { table: "questions", where: `body IN ${sqlInList(col("questions", "body"))}` },
    { table: "users", where: `code IN ${sqlInList(col("demo_users", "code"))}` },
  ];
}
