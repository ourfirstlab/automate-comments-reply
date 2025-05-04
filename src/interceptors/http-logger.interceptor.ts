import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(HttpLoggerInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    this.logger.log(`Response Status: ${response.statusCode}`);
                    this.logger.log('Response Body:', JSON.stringify(data, null, 2));
                },
                error: (error) => {
                    this.logger.error(`Error Status: ${error.response?.status || 'Unknown'}`);
                    this.logger.error('Error Response:', JSON.stringify(error.response?.data || error.message, null, 2));
                }
            })
        );
    }
} 