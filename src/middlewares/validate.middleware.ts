import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { AppError } from '../utils/app-error.util';

export const validateRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    next(
      new AppError(400, 'Validation failed', {
        errors: result.array().map((error) => ({
          field: error.type === 'field' ? error.path : undefined,
          message: error.msg,
          value: error.type === 'field' ? error.value : undefined
        }))
      })
    );
    return;
  }

  next();
};
