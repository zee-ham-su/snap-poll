import { LRUCache } from "lru-cache";

const rateLimitCache = new LRUCache<string, number>({
  max: 1000, // Maximum number of entries
  ttl: 60 * 1000, // Time-to-live in milliseconds (1 minute)
});

export function rateLimit(key: string, limit: number): boolean {
  const currentCount = rateLimitCache.get(key) || 0;

  if (currentCount >= limit) {
    return false; // Rate limit exceeded
  }

  rateLimitCache.set(key, currentCount + 1);
  return true; // Allowed
}