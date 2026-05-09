const successResponse = (res, message, data = {}, meta = {}, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data, meta });

const errorResponse = (res, message, errors = [], statusCode = 500) =>
  res.status(statusCode).json({ success: false, message, errors });

module.exports = { successResponse, errorResponse };
