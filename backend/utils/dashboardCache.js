const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

const cache = new Map();

const stableStringify = (value) => {
  if (!value || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
};

const makeCacheKey = (namespace, params = {}) => `${namespace}:${stableStringify(params)}`;

const trimCache = () => {
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
};

export const getCachedDashboardData = async (
  namespace,
  params,
  producer,
  ttlMs = DEFAULT_CACHE_TTL_MS
) => {
  const key = makeCacheKey(namespace, params);
  const cached = cache.get(key);
  const now = Date.now();

  if (cached?.value !== undefined && cached.expiresAt > now) {
    return cached.value;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = Promise.resolve()
    .then(producer)
    .then((value) => {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
      trimCache();
      return value;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, {
    promise,
    expiresAt: now + ttlMs,
  });

  return promise;
};

export const invalidateDashboardCache = () => {
  cache.clear();
};

export const cacheDashboardResponse = (namespace, ttlMs = DEFAULT_CACHE_TTL_MS) => async (req, res, next) => {
  try {
    const cachedValue = await getCachedDashboardData(
      namespace,
      req.query,
      () => new Promise((resolve, reject) => {
        const originalJson = res.json.bind(res);

        res.json = (body) => {
          resolve(body);
          return originalJson(body);
        };

        res.once('finish', () => {
          if (res.statusCode >= 400) {
            cache.delete(makeCacheKey(namespace, req.query));
          }
        });

        res.once('error', reject);
        next();
      }),
      ttlMs
    );

    if (!res.headersSent) {
      res.json(cachedValue);
    }
  } catch (error) {
    next(error);
  }
};
