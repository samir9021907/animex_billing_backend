import type { PaginationMeta } from '../interface/common.interface';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parsePage = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_PAGE;
  }

  return Math.floor(parsed);
};

export const parseLimit = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.floor(parsed), MAX_LIMIT);
};

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  return {
    page,
    limit,
    total,
    total_pages: Math.max(Math.ceil(total / limit), 1)
  };
};
