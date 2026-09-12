import type { AuthClientPayload } from './client.interface';

declare global {
  namespace Express {
    interface Request {
      client?: AuthClientPayload;
    }
  }
}

export {};
