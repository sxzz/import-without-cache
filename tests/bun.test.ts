import { expect, test } from 'bun:test'
import { clearRequireCache } from '../src/index.ts'

test('clear cache', async () => {
  // @ts-expect-error missing type
  const mod = await import('./fixtures/mod.js')
  // @ts-expect-error missing type
  const mod2 = await import('./fixtures/mod.js')

  expect(mod).toBe(mod2)

  clearRequireCache()
  // @ts-expect-error missing type
  const mod3 = await import('./fixtures/mod.js')
  expect(mod).not.toBe(mod3)
  expect(mod.uuid).not.toBe(mod3.uuid)
  expect(mod.cjs).not.toBe(mod3.cjs)
  expect(mod.requireESM).not.toBe(mod3.requireESM)
  expect(mod.importCJS).not.toBe(mod3.importCJS)
  expect(mod.dynamicImportCJS).not.toBe(mod3.dynamicImportCJS)
  expect(mod.url).toMatch(/\.js$/)
})
