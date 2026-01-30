const CACHE_PREFIX = 'text-analyzer-fingerprint-cache';

type FingerprintCache = Record<string, boolean>;

const getCacheKey = (ownerId: string): string => `${CACHE_PREFIX}:${ownerId}`;

const readCache = (ownerId: string): FingerprintCache => {
  const raw = localStorage.getItem(getCacheKey(ownerId));
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as FingerprintCache;
    return parsed ?? {};
  } catch {
    return {};
  }
};

const writeCache = (ownerId: string, cache: FingerprintCache): void => {
  localStorage.setItem(getCacheKey(ownerId), JSON.stringify(cache));
};

export const isFingerprintCached = (ownerId: string, fingerprintHash: string): boolean => {
  const cache = readCache(ownerId);
  return Boolean(cache[fingerprintHash]);
};

export const cacheFingerprint = (ownerId: string, fingerprintHash: string): void => {
  const cache = readCache(ownerId);
  cache[fingerprintHash] = true;
  writeCache(ownerId, cache);
};
