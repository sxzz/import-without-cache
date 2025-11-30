import module, { type LoadHookContext } from 'node:module'
import process from 'node:process'

const namespace = 'no-cache://'
const namespaceLength = namespace.length

declare global {
  interface ImportAttributes {
    cache?: 'no'
  }
}

export const isSupported: boolean = !!module.registerHooks

let deregister: (() => void) | undefined
export function init(): () => void {
  if (process.versions.bun) {
    throw new Error(
      'init is unnecessary in Bun, use clearRequireCache() instead.',
    )
  }
  if (!isSupported) {
    throw new Error('import-without-cache requires Node.js v20.19.0 or higher.')
  }

  if (deregister) return deregister

  const hooks = module.registerHooks({
    resolve(specifier, context, nextResolve) {
      const parentUUID = getParentUUID(context.parentURL)
      const fromNoCache =
        !module.isBuiltin(specifier) &&
        (specifier.startsWith(namespace) ||
          context.importAttributes?.cache === 'no' ||
          parentUUID)

      if (!fromNoCache) {
        return nextResolve(specifier, context)
      }

      if (specifier.startsWith(namespace)) {
        specifier = specifier.slice(namespaceLength)
      }

      const resolved = nextResolve(specifier, context)
      resolved.url = appendUUID(resolved.url, parentUUID || crypto.randomUUID())
      return resolved
    },

    load(url, context, nextLoad) {
      cleanupImportAttributes(context)
      return nextLoad(url, context)
    },
  })

  return (deregister = () => {
    hooks.deregister()
    deregister = undefined
  })
}

export function clearRequireCache(): void {
  for (const key of Object.keys(require.cache)) {
    delete require.cache[key]
  }
}

function getParentUUID(parentURL: string | undefined) {
  if (!parentURL) return
  return new URL(parentURL).searchParams.get('no-cache') ?? undefined
}

function appendUUID(url: string, uuid: string): string {
  const parsed = new URL(url)
  parsed.searchParams.set('no-cache', uuid)
  return parsed.toString()
}

function cleanupImportAttributes(context: LoadHookContext): void {
  if (!context.importAttributes?.cache) return
  const attrs = Object.assign(Object.create(null), context.importAttributes)
  delete attrs.cache
  context.importAttributes = attrs
  Object.freeze(context.importAttributes)
}
