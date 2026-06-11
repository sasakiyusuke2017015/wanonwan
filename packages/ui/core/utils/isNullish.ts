/**
 * 値がnull的（nullish）かどうかを判定
 *
 * null, undefined, 空文字列をnull的として扱う
 */
export function isNullish(value: unknown): value is null | undefined | '' {
  return value === null || value === undefined || value === '';
}
