const Joi = require("joi");

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().default(5000),
  APP_NAME: Joi.string().default("HRMS API"),
  MONGO_URI: Joi.string().default("mongodb://localhost:27017/hrms"),
  REDIS_URL: Joi.string().allow(""),
  JWT_ACCESS_SECRET: Joi.string().min(32).default("replace_with_super_secure_access_secret_123"),
  JWT_REFRESH_SECRET: Joi.string().min(32).default("replace_with_super_secure_refresh_secret_123"),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),
  COOKIE_DOMAIN: Joi.string().allow(""),
  CORS_ORIGIN: Joi.string().default("*"),
  BCRYPT_SALT_ROUNDS: Joi.number().default(10),
  FRONTEND_URL: Joi.string().allow(""),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX: Joi.number().default(200),
  MAX_LOGIN_ATTEMPTS: Joi.number().default(5),
  LOCKOUT_MINUTES: Joi.number().default(30)
}).unknown();

const { value, error } = schema.validate(process.env);
if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

module.exports = value;
