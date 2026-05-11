const Redis = require("ioredis");
const env = require("./env");
const logger = require("./logger");

let redisClient = null;

const connectRedis = async () => {
  // Skip Redis if no URL is configured or if it's pointing to localhost in production
  if (!env.REDIS_URL) {
    logger.warn("REDIS_URL not set — Redis disabled");
    return null;
  }
  const isLocalhostRedis = env.REDIS_URL.includes("127.0.0.1") || env.REDIS_URL.includes("localhost");
  if (isLocalhostRedis && env.NODE_ENV === "production") {
    logger.warn("Localhost Redis detected in production — Redis disabled");
    return null;
  }
  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redisClient.on("connect", () => logger.info("Redis connected"));
    redisClient.on("error", (error) => {
      logger.error({ error }, "Redis error");
      // Don't crash the process on Redis errors
    });
    await redisClient.connect().catch((err) => {
      logger.warn({ err }, "Redis connection failed — continuing without Redis");
      redisClient = null;
    });
  } catch (err) {
    logger.warn({ err }, "Redis init failed — continuing without Redis");
    redisClient = null;
  }
  return redisClient;
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
