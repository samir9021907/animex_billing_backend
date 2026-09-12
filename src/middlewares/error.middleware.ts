import type { ErrorRequestHandler } from 'express';
import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError
} from 'sequelize';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { AppError } from '../utils/app-error.util';
import { sendError } from '../utils/response.util';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown = null;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'A record with the same value already exists';
    details = error.errors.map((item) => ({
      field: item.path,
      message: item.message
    }));
  } else if (error instanceof ValidationError) {
    statusCode = 400;
    message = 'Database validation failed';
    details = error.errors.map((item) => item.message);
  } else if (error instanceof ForeignKeyConstraintError) {
    statusCode = 409;
    message = 'Foreign key constraint failed';
    details = error.message;
  } else if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Invalid or expired token';
    details = error.message;
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  sendError(res, message, details, statusCode);
};
