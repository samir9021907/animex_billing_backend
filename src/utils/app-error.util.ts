export class AppError extends Error {
  public readonly statusCode: number;

  public readonly details: unknown;

  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, details: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}
