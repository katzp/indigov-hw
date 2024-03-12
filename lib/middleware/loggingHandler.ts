import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export const loggingHandler = (req: Request, res: Response, next: NextFunction) => {
    res.locals.reqStartTime = Date.now();
    res.on('finish', () => {
        logger.info({
            title: 'Request Summary',
            method: req.method,
            url: req.originalUrl,
            queryParams: req.query,
            pathParams: req.params,
            body: req.body,
            requestHeaders: req.headers,
            responseHeaders: res.getHeaders(),
            statusCode: res.statusCode,
            responseMs: Date.now() - res.locals.reqStartTime
        });
    });
    next();
};
