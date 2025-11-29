import assert from 'node:assert'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { init } from '../src/index.ts'

const require = createRequire(import.meta.url)

function pureCJSCache() {
  for (const key of Object.keys(require.cache)) {
    delete require.cache[key]
  }
}

test('import attributes', async () => {
  const deregister = init()
  const { uuid, url, cjs } = await import('./fixtures/mod.ts', {
    with: { cache: 'no' },
  })
  assert.match(url, /\?[0-9a-f-]{36}$/)

  const { uuid: uuid2, cjs: cjs2 } = await import('./fixtures/mod.ts', {
    with: { cache: 'no' },
  })
  assert.notEqual(uuid, uuid2)
  assert.equal(cjs, cjs2)

  pureCJSCache()
  const { uuid: uuid3 } = await import('./fixtures/mod.ts', {
    with: { cache: 'no' },
  })
  assert.notEqual(uuid2, uuid3)

  deregister()

  await assert.rejects(
    () =>
      import('./fixtures/mod.ts', {
        with: { cache: 'no' },
      }),
  )
})

test('no-cache protocol', async () => {
  const deregister = init()

  // @ts-expect-error
  const mod = JSON.stringify(await import('no-cache://./fixtures/mod.ts'))
  // @ts-expect-error
  const mod2 = JSON.stringify(await import('no-cache://./fixtures/mod.ts'))
  assert.notEqual(mod, mod2)
  deregister()

  // @ts-expect-error
  await assert.rejects(() => import('no-cache://./fixtures/mod.ts'))
})
