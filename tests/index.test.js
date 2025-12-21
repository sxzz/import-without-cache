// @ts-check

import assert from 'node:assert'
import { afterEach, test } from 'node:test'
import { clearRequireCache, init, unregister } from '../dist/index.mjs'

afterEach(() => {
  unregister()
})

const RE_NO_CACHE = /\?no-cache=[0-9a-f-]{36}$/

test('import attributes', async () => {
  const deregister = init()
  const { uuid, url, cjs, requireESM, importCJS, dynamicImportCJS } =
    await import('./fixtures/mod.js', {
      with: { cache: 'no' },
    })
  const {
    uuid: uuid2,
    cjs: cjs2,
    requireESM: requireESM2,
    importCJS: importCJS2,
    dynamicImportCJS: dynamicImportCJS2,
  } = await import('./fixtures/mod.js', {
    with: { cache: 'no' },
  })
  clearRequireCache()
  const {
    uuid: uuid3,
    cjs: cjs3,
    requireESM: requireESM3,
    importCJS: importCJS3,
    dynamicImportCJS: dynamicImportCJS3,
  } = await import(
    // absolute URL
    new URL('fixtures/mod.js', import.meta.url).href,
    {
      with: { cache: 'no' },
    }
  )

  assert.match(url, RE_NO_CACHE)

  // import + ESM
  assert.notEqual(uuid, uuid2)
  assert.notEqual(uuid2, uuid3)

  // require + CJS
  assert.equal(cjs, cjs2)
  // require + CJS + clearRequireCache
  assert.notEqual(cjs2, cjs3)

  // import + CJS
  assert.equal(importCJS, importCJS2)
  // import + CJS + clearRequireCache
  assert.notEqual(importCJS2, importCJS3)

  // dynamic import + CJS
  assert.equal(dynamicImportCJS, dynamicImportCJS2)
  // dynamic import + CJS + clearRequireCache
  assert.notEqual(dynamicImportCJS2, dynamicImportCJS3)

  // known limitation: require cache can't be fully cleared
  assert.equal(requireESM, requireESM2)
  assert.equal(requireESM2, requireESM3)

  deregister()

  await assert.rejects(
    () => import('./fixtures/mod.js', { with: { cache: 'no' } }),
  )
})

test('no-cache protocol', async () => {
  const deregister = init()

  // @ts-expect-error
  const mod = JSON.stringify(await import('no-cache://./fixtures/mod.js'))
  const mod2 = JSON.stringify(
    await import(
      // absolute URL
      `no-cache://${new URL('fixtures/mod.js', import.meta.url).href}`
    ),
  )
  assert.notEqual(mod, mod2)
  deregister()

  // @ts-expect-error
  await assert.rejects(() => import('no-cache://./fixtures/mod.js'))
})

test('register twice', () => {
  const deregister1 = init()
  const deregister2 = init()
  assert.equal(deregister1, deregister2)
  deregister1()

  const deregister3 = init()
  assert.notEqual(deregister1, deregister3)
  deregister3()
})

test('skip node_modules', () => {
  const deregister = init({ skipNodeModules: false })
  assert.match(import.meta.resolve('no-cache://tsdown'), RE_NO_CACHE)
  deregister()

  const deregister2 = init({ skipNodeModules: true })
  assert.doesNotMatch(import.meta.resolve('no-cache://tsdown'), RE_NO_CACHE)
  deregister2()
})

test('data URL', async () => {
  const code = 'export const foo = 42'

  init()
  const { foo } = await import(`data:text/javascript;base64,${btoa(code)}`, {
    with: { cache: 'no' },
  })

  assert.equal(foo, 42)
})
