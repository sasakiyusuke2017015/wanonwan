"use client";

import { Modal } from "@ui-catalog/core/organisms/Modal";
import { PillSelect } from "@ui-catalog/core/molecules";
import { Button } from "@ui-catalog/core/molecules";
import { Stack, Text } from "@ui-catalog/core/atoms";
import {
  useColorTheme,
  useShapeTheme,
  useBackgroundTheme,
  useResetAllTheme,
  useTheme,
} from "@ui-catalog/core/infra/theme";

const COLOR_OPTIONS = [
  { value: "emerald", label: "エメラルド" },
  { value: "slate", label: "スレート" },
  { value: "indigo", label: "インディゴ" },
  { value: "blue", label: "ブルー" },
  { value: "rose", label: "ローズ" },
  { value: "light", label: "ライト" },
] as const;

const SHAPE_OPTIONS = [
  { value: "soft", label: "やわらか" },
  { value: "rounded", label: "丸み" },
  { value: "sharp", label: "シャープ" },
] as const;

const BACKGROUND_OPTIONS = [
  { value: "wood", label: "木目" },
  { value: "flooring", label: "フロア" },
  { value: "fabric", label: "布" },
  { value: "concrete", label: "タイル" },
  { value: "leather", label: "紙" },
  { value: "marble", label: "ミント" },
  { value: "cream", label: "クリーム" },
  { value: "lavender", label: "ラベンダー" },
  { value: "sky", label: "スカイ" },
] as const;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

// テーマ 3 軸（色 / 形 / 背景）の切替パネル。設定は @ui-catalog の Jotai atom 経由で localStorage 永続化される。
export function ThemeSettingsModal({ isOpen, onClose }: Props) {
  const [colorTheme, setColorTheme] = useColorTheme();
  const [shapeTheme, setShapeTheme] = useShapeTheme();
  const [backgroundTheme, setBackgroundTheme] = useBackgroundTheme();
  const resetAll = useResetAllTheme();
  const { shapes } = useTheme();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="表示テーマ"
      maxWidth="32rem"
      borderRadius={shapes.modalRadius}
    >
      <Stack gap={20}>
        <Stack gap={8}>
          <Text size="sm" weight="bold">
            色
          </Text>
          <PillSelect
            options={COLOR_OPTIONS}
            value={colorTheme}
            onChange={(v) => setColorTheme(v as typeof colorTheme)}
          />
        </Stack>

        <Stack gap={8}>
          <Text size="sm" weight="bold">
            形
          </Text>
          <PillSelect
            options={SHAPE_OPTIONS}
            value={shapeTheme}
            onChange={(v) => setShapeTheme(v as typeof shapeTheme)}
          />
        </Stack>

        <Stack gap={8}>
          <Text size="sm" weight="bold">
            背景
          </Text>
          <PillSelect
            options={BACKGROUND_OPTIONS}
            value={backgroundTheme}
            onChange={(v) => setBackgroundTheme(v as typeof backgroundTheme)}
          />
        </Stack>

        <div className="flex justify-between pt-2">
          <Button variant="secondary" onClick={resetAll} borderRadius={shapes.buttonRadius}>
            既定に戻す
          </Button>
          <Button onClick={onClose} borderRadius={shapes.buttonRadius}>
            閉じる
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
