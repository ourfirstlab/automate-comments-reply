import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {

        const rawBody = (req as any).rawBody;
        console.log('Raw Request Payload:', req.method, req.baseUrl, req.originalUrl, req.query, rawBody ? rawBody.toString() : 'No raw body available');

        res.on('close', () => {
            const { statusCode, statusMessage } = res;
            console.log('Raw Response:', req.method, req.baseUrl, req.originalUrl, statusCode, statusMessage);
        });

        next();
    }
} 