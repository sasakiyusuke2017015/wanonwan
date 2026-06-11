"use client";

import { Badge, Box, Stack, Text } from "@ui-catalog/core/atoms";

// ui-catalog 結合テスト用ページ。
// packages/ui を transpile + Tailwind v4 トークン + SCSS Modules で配線できているかを確認する。
export default function UiDemoPage() {
  return (
    <main className="p-8">
      <Stack>
        <Text size="2xl" weight="bold">
          ui-catalog 結合テスト
        </Text>
        <Text variant="muted">
          packages/ui（@ui-catalog/core）を transpile + Tailwind v4 トークン + SCSS Modules で配線
        </Text>
        <Box className="mt-4 flex gap-2">
          <Badge value="solid" color="blue" />
          <Badge value="success" variant="success" />
          <Badge value="score" appearance="score" color="green" />
        </Box>
      </Stack>
    </main>
  );
}
