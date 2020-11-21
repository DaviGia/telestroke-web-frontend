export interface PageResponse<T> {
    page: Number;
    limit: Number;
    total: Number;
    data: T[];
}