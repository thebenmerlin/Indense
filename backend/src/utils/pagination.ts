import { PaginationParams, PaginatedResult } from '../types';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export interface PaginationMeta {
    skip: number;
    take: number;
    page: number;
    limit: number;
}

/**
 * Parse and validate pagination parameters from request query
 */
export function parsePaginationParams(params: PaginationParams): PaginationMeta {
    const page = Math.max(1, params.page || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    return { skip, take: limit, page, limit };
}

/**
 * Build paginated response object
 */
export function buildPaginatedResult<T>(
    data: T[],
    total: number,
    pagination: PaginationMeta
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / pagination.limit);

    return {
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1,
        },
    };
}

/**
 * Parse sort parameters for Prisma
 */
export function parseSortParams(
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    allowedFields: string[] = ['createdAt']
): Record<string, 'asc' | 'desc'> | undefined {
    if (!sortBy || !allowedFields.includes(sortBy)) {
        return { createdAt: 'desc' }; // Default sort
    }

    return { [sortBy]: sortOrder || 'desc' };
}
