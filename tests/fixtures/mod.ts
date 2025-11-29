import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export * from './rand.ts'
export const cjs: string = require('./cjs.cts')
export const url: string = import.meta.url
