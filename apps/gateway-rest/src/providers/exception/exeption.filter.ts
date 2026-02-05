import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FinalExceptionDto } from './exception.dto';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // check for 5** errors and log them
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (status >= 500 && status < 600) {
      Logger.error(exception, 'ExceptionFilter');
    }

    const exceptionResponse: unknown =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error)?.message ?? 'Internal server error' };
    let messageString = 'Internal server error';
    type ValidationItem = {
      property: string;
      constraints: { [key: string]: string };
    };
    let validationErrors: ValidationItem[] | undefined;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;

      if (
        'message' in resp &&
        typeof resp.message === 'string' &&
        resp.message !== ''
      ) {
        messageString = resp.message;
      }

      if ('validationErrors' in resp && Array.isArray(resp.validationErrors)) {
        const maybeArray = resp.validationErrors as unknown[];
        const validated: ValidationItem[] = [];

        for (const item of maybeArray) {
          if (typeof item === 'object' && item !== null) {
            const it = item as Record<string, unknown>;
            if (
              typeof it.property === 'string' &&
              typeof it.constraints === 'object' &&
              it.constraints !== null
            ) {
              const constraintsObj: { [key: string]: string } = {};
              for (const k of Object.keys(
                it.constraints as Record<string, unknown>,
              )) {
                const v = (it.constraints as Record<string, unknown>)[k];
                if (typeof v === 'string') constraintsObj[k] = v;
              }
              validated.push({
                property: it.property,
                constraints: constraintsObj,
              });
            }
          }
        }

        if (validated.length > 0) validationErrors = validated;
      }
    }

    // Build final message payload safely
    let message: string | { [key: string]: { [key: string]: string } } =
      messageString;
    if (validationErrors) {
      const errors: { [key: string]: { [key: string]: string } } = {};
      for (const v of validationErrors) {
        errors[v.property] = v.constraints;
      }
      message = errors;
    }

    const errorResponse: FinalExceptionDto = {
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    } as FinalExceptionDto;

    response.status(status).json(errorResponse);
  }
}
