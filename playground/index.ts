import { createRequire } from 'node:module'
import { init } from '../src/index.ts'
const require = createRequire(import.meta.url)

init()

{
  const mod = await import('./mod.ts', { with: { cache: 'no' } })
  console.info(mod)
}

{
  // clean cache
  for (const key of Object.keys(require.cache)) {
    delete require.cache[key]
  }
  const mod = await import('./mod.ts', { with: { cache: 'no' } })
  console.info(mod)
}
{
  // @ts-ignore
  const { number } = await import(`./mod.ts?${crypto.randomUUID()}&no-cache`)
  console.info(number)
}

{
  const { number } = require('no-cache://./mod.ts')
  console.info(number)
}
