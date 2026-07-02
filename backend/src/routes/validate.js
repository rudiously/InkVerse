import { validationResult } from 'express-validator';
import { validationErrorMap } from '../middleware/errorHandler.js';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed.', details: validationErrorMap(errors) });
  }
  next();
}
