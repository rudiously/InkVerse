export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || 'Something went wrong on our end. Please try again.',
    ...(process.env.NODE_ENV === 'development' ? { detail: err.message, stack: err.stack } : {}),
  });
}

export function validationErrorMap(errors) {
  return errors.array().map((e) => ({ field: e.path, message: e.msg }));
}
