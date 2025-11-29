import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export * from './rand.js'
export const cjs = require('./cjs.cjs')
export const requireESM = require('./require-esm.js')
export const url = import.meta.url
