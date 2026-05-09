require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const env = require("./config/env");
const logger = require("./config/logger");

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    const server = http.createServer(app);
    server.listen(env.PORT, () => logger.info(`${env.APP_NAME} running on port ${env.PORT}`));
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
