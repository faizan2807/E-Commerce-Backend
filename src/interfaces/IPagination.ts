export interface PaginationOptions {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc" | 1 | -1;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
