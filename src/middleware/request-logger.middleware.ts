import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from "crypto"
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {

        const rawBody = (req as any).rawBody;
        console.log('Raw Request Payload:', req.method, req.baseUrl, req.originalUrl, req.query, req.headers, rawBody ? rawBody.toString() : 'No raw body available');

        const calculatedChecksum = crypto.createHmac('sha1', process.env.INSTAGRAM_APP_SECRET || "")
            .update(rawBody)
            .digest('hex');

        const calculatedChecksum256 = crypto.createHmac('sha256', process.env.INSTAGRAM_APP_SECRET || "")
            .update(rawBody)
            .digest('hex');

        console.log({ calculatedChecksum, calculatedChecksum256 })

        res.on('close', () => {
            const { statusCode, statusMessage } = res;
            console.log('Raw Response:', req.method, req.baseUrl, req.originalUrl, statusCode, statusMessage);
        });

        next();
    }
} 