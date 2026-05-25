import Redis from "ioredis";
import { config } from "./config";

let redisClient: Redis | null = null;
let isRedisAvailable = false;

// In-memory fallback for when Redis is not available
const memoryStore = new Map<string, { value: string; expiry?: number }>();

export async function getRedisClient(): Promise<Redis> {
  if (redisClient && isRedisAvailable) {
    return redisClient;
  }

  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        if (times > 3) {
          console.warn("⚠️  Redis unavailable — using in-memory fallback");
          isRedisAvailable = false;
          return null; // stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on("error", () => {
      // Suppress unhandled error events from printing to console
      // The retry strategy handles the fallback logic
    });

    await redisClient.connect();
    isRedisAvailable = true;
    console.log("✅ Redis connected");
    return redisClient;
  } catch {
    console.warn("⚠️  Redis unavailable — using in-memory fallback");
    isRedisAvailable = false;
    return createMemoryFallback();
  }
}

function createMemoryFallback(): Redis {
  // Return a proxy that mimics basic Redis operations using Map
  const handler: ProxyHandler<object> = {
    get(_target, prop: string) {
      if (prop === "status") return "ready";
      if (prop === "duplicate") return () => createMemoryFallback();
      if (prop === "disconnect" || prop === "quit") return () => Promise.resolve();

      if (prop === "get") {
        return (key: string) => {
          const entry = memoryStore.get(key);
          if (!entry) return Promise.resolve(null);
          if (entry.expiry && Date.now() > entry.expiry) {
            memoryStore.delete(key);
            return Promise.resolve(null);
          }
          return Promise.resolve(entry.value);
        };
      }

      if (prop === "set") {
        return (key: string, value: string, ...args: unknown[]) => {
          let expiry: number | undefined;
          if (args[0] === "EX" && typeof args[1] === "number") {
            expiry = Date.now() + args[1] * 1000;
          }
          memoryStore.set(key, { value, expiry });
          return Promise.resolve("OK");
        };
      }

      if (prop === "del") {
        return (...keys: string[]) => {
          keys.forEach((k) => memoryStore.delete(k));
          return Promise.resolve(keys.length);
        };
      }

      if (prop === "ping") {
        return () => Promise.resolve("PONG");
      }

      // For any other method, return a no-op
      return () => Promise.resolve(null);
    },
  };

  return new Proxy({}, handler) as unknown as Redis;
}

export { isRedisAvailable };
