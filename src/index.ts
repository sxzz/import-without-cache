import module, { type LoadHookContext } from 'node:module'

const namespace = 'no-cache://'
const namespaceLength = namespace.length

const noCacheModules = new Set<string>()

declare global {
  interface ImportAttributes {
    cache?: 'no'
  }
}

export function init(): () => void {
  if (!module.registerHooks) {
    throw new Error('import-without-cache requires Node.js v20.19.0 or higher.')
  }

  const hooks = module.registerHooks({
    resolve(specifier, context, nextResolve) {
      const fromNoCache =
        !module.isBuiltin(specifier) &&
        (specifier.startsWith(namespace) ||
          context.importAttributes?.cache === 'no' ||
          (context.parentURL && noCacheModules.has(context.parentURL)))

      if (!fromNoCache) {
        return nextResolve(specifier, context)
      }

      if (specifier.startsWith(namespace)) {
        specifier = specifier.slice(namespaceLength)
      }

      const resolved = nextResolve(specifier, context)
      resolved.url = `${resolved.url}?${crypto.randomUUID()}`
      noCacheModules.add(resolved.url)

      return resolved
    },

    load(url, context, nextLoad) {
      cleanupImportAttributes(context)

      if (url.startsWith(namespace)) {
        url = url.slice(namespaceLength, -37 /* length of ? + uuid */)
      }

      return nextLoad(url, context)
    },
  })
  return hooks.deregister.bind(hooks)
}

function cleanupImportAttributes(context: LoadHookContext): void {
  if (!context.importAttributes?.cache) return
  const attrs = Object.assign(Object.create(null), context.importAttributes)
  delete attrs.cache
  context.importAttributes = attrs
  Object.freeze(context.importAttributes)
}
