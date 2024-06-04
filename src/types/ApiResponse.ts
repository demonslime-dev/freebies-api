export interface SuccessResponse<T> {
    status: 'success',
    data: T
}

export interface ErrorResponse {
    status: 'fail' | 'error',
    message: string,
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;
