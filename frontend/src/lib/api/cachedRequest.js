const cache = new Map()

export function cachedRequest(key, fetcher, ttlMs = 5 * 60 * 1000) {
  const entry = cache.get(key)

  if (entry?.data && ttlMs > 0 && Date.now() - entry.at < ttlMs) {
    return Promise.resolve(entry.data)
  }

  if (entry?.promise) {
    return entry.promise
  }

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, at: Date.now(), promise: null })
      return data
    })
    .catch((err) => {
      // No cachear errores, limpiar promise para reintentar
      const current = cache.get(key)
      if (current?.promise === promise) {
        cache.delete(key)
      }
      throw err
    })
    .finally(() => {
      const current = cache.get(key)
      if (current?.promise === promise) {
        // Mantener data pero limpiar promise
        cache.set(key, { ...current, promise: null })
      }
    })

  cache.set(key, { ...(entry || {}), promise, data: entry?.data, at: entry?.at })
  return promise
}

export function invalidateCache(key) {
  cache.delete(key)
}
