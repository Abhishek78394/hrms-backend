const validate = (schema) => (req, res, next) => {
  const payload = {
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers
  };
  const { error, value } = schema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) return next(error);
  req.validated = value;
  return next();
};

module.exports = validate;
