import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { AppError } from './app-error.util';
import type { AuthClientPayload } from '../interface/client.interface';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || '';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

export const signToken = (payload: AuthClientPayload): string => {
  if (!jwtSecret) {
    throw new AppError(500, 'JWT secret is not configured');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn as any });
};

export const verifyToken = (token: string): AuthClientPayload => {
  if (!jwtSecret) {
    throw new AppError(500, 'JWT secret is not configured');
  }

  const decoded = jwt.verify(token, jwtSecret);

  if (typeof decoded === 'string') {
    throw new AppError(401, 'Invalid authentication token');
  }

  const { id, name, email, phone_number, status, created_at, updated_at } = decoded as Partial<AuthClientPayload>;

  if (!id || !name || !email || typeof status !== 'boolean') {
    throw new AppError(401, 'Invalid authentication token');
  }

  return {
    id,
    name,
    email,
    phone_number: phone_number ?? null,
    status,
    created_at,
    updated_at
  };
};
