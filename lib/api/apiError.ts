export class ApiError {
    status: number;
    message: string;
    detail?: string;

    constructor(status: number, msg: string, detail?: string) {
        this.status = status;
        this.message = msg;
        this.detail = detail;
    }

    static badRequest(detail?: string) {
        return new ApiError(400, 'Bad Request', detail);
    }

    static unauthorized() {
        return new ApiError(401, 'Unauthorized');
    }

    static forbidden(detail?: string) {
        return new ApiError(403, 'Forbidden', detail);
    }

    static notFound(detail?: string) {
        return new ApiError(404, 'Resource Not Found', detail);
    }

    static conflict(detail?: string) {
        return new ApiError(409, 'Conflict', detail);
    }

    static unprocessable(detail?: string) {
        return new ApiError(422, 'Unprocessable', detail);
    }

    static tooManyRequests(detail?: string) {
        return new ApiError(429, 'Too Many Requests', detail);
    }

    static internal(detail?: string) {
        return new ApiError(500, 'Internal Server Error', detail);
    }
}
