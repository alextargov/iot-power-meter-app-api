// Inspired by the excellent HTTP Exception handling in NestJS.
import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => res.status(error.status).json({
    statusCode: error.status,
    error: error.name,
    message: error.message,
    errors: error.errors || null,
    timestamp: new Date().toISOString(),
    path: req ? req.url : null,
});
