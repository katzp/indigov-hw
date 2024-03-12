import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../api/apiError';
import { logger } from "../logger";

const sendApiError = (err: ApiError, res: Response) => {
    res.status(err.status).json({ message: err.message, detail: err.detail });
};

export const errorHandler = (
    err: ApiError | Error,
    req: Request,
    res: Response,
    next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
    logger.info({ title: 'Handling request error', err });

    // For client errors controllers should always `return next(ApiError.[staticMethod])`
    // This way we can ensure consistent error responses in this error handler
    if (err instanceof ApiError) {
        sendApiError(err, res);
        return;
    }

    // Catch all is Internal Server Error
    const internalError = ApiError.internal(err.message);
    sendApiError(internalError, res);
};
