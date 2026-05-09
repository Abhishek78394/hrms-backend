const Redis = require("ioredis");
const env = require("./env");
const logger = require("./logger");

let redisClient = null;

const connectRedis = async () => {
  if (!env.REDIS_URL) return null;
  redisClient = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 1 });
  redisClient.on("connect", () => logger.info("Redis connected"));
  redisClient.on("error", (error) => logger.error({ error }, "Redis error"));
  return redisClient;
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
