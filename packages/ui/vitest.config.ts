import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@ui-catalog\/core\/(.+)/, replacement: path.resolve(__dirname, 'core/$1') },
      { find: '@ui-catalog/core', replacement: path.resolve(__dirname, 'index.ts') },
    ],
  },
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.storybook/**'],
    setupFiles: ['./vitest.setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
