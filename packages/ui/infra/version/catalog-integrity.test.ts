import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { VERSION_REGISTRY } from './registry'

// component 削除・改名時の追随漏れを検出する整合性テスト。
// tsc は package.json#exports の target 実在性も versions.json との同期も
// 検査しないため、ここで担保する (束① レビュー BLOCKER の再発防止)。
const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

describe('catalog integrity', () => {
  it('package.json の全 exports target が実在する', () => {
    const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf-8')) as {
      exports: Record<string, string>
    }
    const missing = Object.entries(pkg.exports)
      .filter(([, target]) => typeof target === 'string' && target.startsWith('./'))
      .filter(([, target]) => !existsSync(join(pkgRoot, target)))
      .map(([subpath, target]) => `${subpath} -> ${target}`)
    expect(missing).toEqual([])
  })

  it('ui-catalog.versions.json が VERSION_REGISTRY と一致する (export-versions で再生成する)', () => {
    const json = JSON.parse(
      readFileSync(join(pkgRoot, 'ui-catalog.versions.json'), 'utf-8'),
    ) as Record<string, string>
    expect(json).toEqual(VERSION_REGISTRY)
  })
})
