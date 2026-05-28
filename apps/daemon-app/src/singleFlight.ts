export function createSingleFlightByKey<K, V>() {
  const inflight = new Map<K, Promise<V>>();

  return async function run(key: K, task: () => Promise<V>): Promise<V> {
    const existing = inflight.get(key);
    if (existing) {
      return existing;
    }

    const promise = task();
    inflight.set(key, promise);

    try {
      return await promise;
    } finally {
      if (inflight.get(key) === promise) {
        inflight.delete(key);
      }
    }
  };
}
