import * as v from "valibot";

// 役職マスタ（positions）。code が権限ロールを決める数値（300-999）。
// 管理者帯（990-999）は app.is_admin() の唯一の源（90_rls_helpers.sql）。
// 管理画面/API からこの帯を作成・変更できると admin 自己昇格になるため、入力段で拒否する
// （最終ガードは 99_rls.sql の positions_write WITH CHECK で二重防御）。
const ADMIN_BAND_MIN = 990;
const ADMIN_BAND_MAX = 999;

const positionCode = v.pipe(
  v.number(),
  v.integer("コードは整数です"),
  v.minValue(1, "コードは 1 以上です"),
  v.maxValue(9999, "コードは 9999 以下です"),
  v.check(
    (c) => c < ADMIN_BAND_MIN || c > ADMIN_BAND_MAX,
    "管理者帯（990-999）は管理画面から作成・変更できません",
  ),
);

export const CreatePositionSchema = v.object({
  code: positionCode,
  name: v.pipe(v.string(), v.minLength(1, "名前は必須です")),
});
export type CreatePosition = v.InferOutput<typeof CreatePositionSchema>;

export const UpdatePositionSchema = v.partial(CreatePositionSchema);
export type UpdatePosition = v.InferOutput<typeof UpdatePositionSchema>;
