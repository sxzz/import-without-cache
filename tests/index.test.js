// @ts-check

import assert from 'node:assert'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { init } from '../dist/index.mjs'

const require = createRequire(import.meta.url)

function pureCJSCache() {
  for (const key of Object.keys(require.cache)) {
    delete require.cache[key]
  }
}

test('import attributes', async () => {
  const deregister = init()
  const { uuid, url, cjs, requireESM } = await import('./fixtures/mod.js', {
    with: { cache: 'no' },
  })
  assert.match(url, /\?[0-9a-f-]{36}$/)

  const {
    uuid: uuid2,
    cjs: cjs2,
    requireESM: requireESM2,
  } = await import('./fixtures/mod.js', {
    with: { cache: 'no' },
  })
  assert.notEqual(uuid, uuid2)
  assert.equal(cjs, cjs2)

  pureCJSCache()
  const { uuid: uuid3, requireESM: requireESM3 } = await import(
    './fixtures/mod.js',
    {
      with: { cache: 'no' },
    }
  )
  assert.notEqual(uuid2, uuid3)

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
  // @ts-expect-error
  const mod2 = JSON.stringify(await import('no-cache://./fixtures/mod.js'))
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
