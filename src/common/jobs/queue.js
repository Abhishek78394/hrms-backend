const { Queue, Worker } = require("bullmq");
const { getRedisClient } = require("../../config/redis");
const logger = require("../../config/logger");

const createQueue = (name) => {
  const connection = getRedisClient();
  if (!connection) return null;
  return new Queue(name, { connection });
};

const createWorker = (name, processor) => {
  const connection = getRedisClient();
  if (!connection) return null;
  const worker = new Worker(name, processor, { connection });
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, `${name} job failed`));
  return worker;
};

module.exports = { createQueue, createWorker };
