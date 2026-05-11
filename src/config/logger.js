const pino = require("pino");

// Use process.env.NODE_ENV directly — env.js may not be loaded yet
// and pino-pretty MUST never run in production (worker threads crash Vercel)
const isProduction = process.env.NODE_ENV === "production";

const transportConfig = isProduction
  ? undefined
  : (() => {
      try {
        // pino-pretty is a devDependency — may not exist in prod builds
        require.resolve("pino-pretty");
        return {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" }
        };
      } catch {
        return undefined;
      }
    })();

const logger = pino({
  name: process.env.APP_NAME || "HRMS API",
  level: isProduction ? "info" : "debug",
  ...(transportConfig ? { transport: transportConfig } : {})
});

module.exports = logger;
