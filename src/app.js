const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const sanitizeHtml = require("sanitize-html");
const routes = require("./routes");
const env = require("./config/env");
const logger = require("./config/logger");
const setupSwagger = require("./docs/swagger");
const notFound = require("./common/middleware/notFound");
const errorHandler = require("./common/middleware/errorHandler");

const app = express();

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
    credentials: true
  })
);
app.use(compression());
app.use(hpp());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use((req, res, next) => {
  if (typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeHtml(req.body[key], { allowedTags: [], allowedAttributes: {} });
      }
    });
  }
  next();
});
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/api/v1", routes);
setupSwagger(app);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
