import type { Response } from 'express';

import type { ApiResponse } from '../interface/common.interface';

export const sendResponse = <T>(res: Response, statusCode: number, payload: ApiResponse<T>): Response => {
  return res.status(statusCode).json(payload);
};

export const sendSuccess = <T>(res: Response, message: string, data: T, statusCode = 200): Response => {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
    error: null
  });
};

export const sendError = (res: Response, message: string, error: unknown = null, statusCode = 400): Response => {
  return sendResponse(res, statusCode, {
    success: false,
    message,
    data: null,
    error
  });
};
