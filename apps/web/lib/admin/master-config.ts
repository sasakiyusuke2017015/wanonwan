import type { Column } from "@ui-catalog/core/organisms/DataTable";
import type { GenericSchema } from "valibot";
import {
  CreateDivisionSchema,
  UpdateDivisionSchema,
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  CreateSectionSchema,
  UpdateSectionSchema,
  CreatePositionSchema,
  UpdatePositionSchema,
  CreateUrgencySchema,
  UpdateUrgencySchema,
} from "@waoon/domain";

// マスタ管理画面（本部/部/課/役職）の共通設定。MasterListView / MasterForm が参照する。
export type MasterField = {
  key: string;
  label: string;
  type: "text" | "number";
};

export type MasterParent = {
  key: string; // ペイロードのキー（例: divisionId）
  label: string; // 表示ラベル（例: 本部）
  endpoint: string; // 親一覧の取得先（例: /api/v1/divisions）
  queryKey: string; // TanStack Query のキー
};

export type MasterConfig = {
  key: string; // queryKey / 識別子（例: divisions）
  title: string; // 画面タイトル（例: 本部）
  listPath: string; // 一覧パス（例: /admin/org/divisions）
  endpoint: string; // API ベース（例: /api/v1/divisions）
  createSchema: GenericSchema;
  updateSchema: GenericSchema;
  fields: MasterField[];
  parent?: MasterParent;
  columns: Column<MasterRow>[];
};

export type MasterRow = { id: string; code: string; name: string };

const CODE_NAME_COLUMNS: Column<MasterRow>[] = [
  { key: "code", label: "コード", width: "30%", align: "left" },
  { key: "name", label: "名前", width: "70%", align: "left" },
];

export const MASTER_CONFIGS: Record<string, MasterConfig> = {
  divisions: {
    key: "divisions",
    title: "本部",
    listPath: "/admin/org/divisions",
    endpoint: "/api/v1/divisions",
    createSchema: CreateDivisionSchema,
    updateSchema: UpdateDivisionSchema,
    fields: [
      { key: "code", label: "コード", type: "text" },
      { key: "name", label: "名前", type: "text" },
    ],
    columns: CODE_NAME_COLUMNS,
  },
  departments: {
    key: "departments",
    title: "部",
    listPath: "/admin/org/departments",
    endpoint: "/api/v1/departments",
    createSchema: CreateDepartmentSchema,
    updateSchema: UpdateDepartmentSchema,
    fields: [
      { key: "code", label: "コード", type: "text" },
      { key: "name", label: "名前", type: "text" },
    ],
    parent: {
      key: "divisionId",
      label: "所属本部",
      endpoint: "/api/v1/divisions",
      queryKey: "divisions",
    },
    columns: CODE_NAME_COLUMNS,
  },
  sections: {
    key: "sections",
    title: "課",
    listPath: "/admin/org/sections",
    endpoint: "/api/v1/sections",
    createSchema: CreateSectionSchema,
    updateSchema: UpdateSectionSchema,
    fields: [
      { key: "code", label: "コード", type: "text" },
      { key: "name", label: "名前", type: "text" },
    ],
    parent: {
      key: "departmentId",
      label: "所属部",
      endpoint: "/api/v1/departments",
      queryKey: "departments",
    },
    columns: CODE_NAME_COLUMNS,
  },
  positions: {
    key: "positions",
    title: "役職",
    listPath: "/admin/positions",
    endpoint: "/api/v1/positions",
    createSchema: CreatePositionSchema,
    updateSchema: UpdatePositionSchema,
    fields: [
      { key: "code", label: "コード（数値・990-999 は管理者帯で作成不可）", type: "number" },
      { key: "name", label: "名前", type: "text" },
    ],
    columns: CODE_NAME_COLUMNS,
  },
  urgency: {
    key: "urgency",
    title: "緊急度",
    listPath: "/admin/urgencies",
    endpoint: "/api/v1/urgencies",
    createSchema: CreateUrgencySchema,
    updateSchema: UpdateUrgencySchema,
    fields: [
      { key: "code", label: "コード（並び順・例 1=低 / 2=中 / 3=高）", type: "number" },
      { key: "name", label: "名前", type: "text" },
    ],
    columns: CODE_NAME_COLUMNS,
  },
};
