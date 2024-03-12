import { Request, Response, NextFunction } from 'express';
import { ApiError } from "../api/apiError";

export const authHandler = (req: Request, res: Response, next: NextFunction) => {
    const authorized = true; // normally some function to authorize request
    if (!authorized) {
        return next(ApiError.unauthorized());
    }
    next()
}
