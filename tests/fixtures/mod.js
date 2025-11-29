import { createRequire } from 'module'

const require = createRequire(import.meta.url)
export const url = import.meta.url

// import + ESM
export * from './rand.js'

// require + CJS
export const cjs = require('./cjs.cjs')

// require + ESM
export const requireESM = require('./require-esm.js')
// import + CJS
export { default as importCJS } from './cjs-import.cjs'
// dynamic import + CJS
export const dynamicImportCJS = (await import('./cjs-dynamic-import.cjs'))
  .default

// circular
export * from './circular.js'
