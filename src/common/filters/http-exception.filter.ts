import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

// Your error response formatter
function handleError<T>(code: number, error: Error, message: string) {
    const executionTime = new Date().toISOString();
    return {
        Code: code,
        ExecutionTime: executionTime,
        Message: message,
        Data: { error: error.message || error },
    };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();

            const res = exception.getResponse();

            if (typeof res === 'string') {
                // response is a plain string
                message = res;
            } else if (typeof res === 'object' && res !== null && 'message' in res) {
                // response is an object with a message property
                const resObj = res as { message?: string | string[] };

                if (Array.isArray(resObj.message)) {
                    message = resObj.message.join(', ');
                } else if (typeof resObj.message === 'string') {
                    message = resObj.message;
                } else {
                    message = exception.message || 'Unexpected error';
                }
            } else {
                message = exception.message || 'Unexpected error';
            }
        } else {
            // Non-HTTP exceptions fallback
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
        }

        const errorResponse = handleError(status, exception as Error, message);

        response.status(status).json(errorResponse);
    }
}
