const Joi = require("joi");

const login = Joi.object({
  body: Joi.object({
    email: Joi.string().email({ tlds: false }).required(),
    password: Joi.string().min(8).required(),
    deviceId: Joi.string().allow("", null)
  }),
  params: Joi.object({}),
  query: Joi.object({}),
  headers: Joi.object().unknown(true)
});

const refreshToken = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().optional()
  }),
  params: Joi.object({}),
  query: Joi.object({}),
  headers: Joi.object().unknown(true)
});

const forgotPassword = Joi.object({
  body: Joi.object({ email: Joi.string().email({ tlds: false }).required() }),
  params: Joi.object({}),
  query: Joi.object({}),
  headers: Joi.object().unknown(true)
});

const resetPassword = Joi.object({
  body: Joi.object({
    email: Joi.string().email({ tlds: false }).required(),
    otp: Joi.string().length(6).required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$/)
      .required()
  }),
  params: Joi.object({}),
  query: Joi.object({}),
  headers: Joi.object().unknown(true)
});

module.exports = { login, refreshToken, forgotPassword, resetPassword };
