import { createRequire } from 'node:module'

// console.log({ url: import.meta.url, filename: import.meta.filename })
const require = createRequire(import.meta.url)

export const cjs = require('./cjs.cts')
export const requireCJS = require('./require-esm.ts').requireCJS

export * from './rand.ts'
