import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseExceptionDto } from '@common-gateway/exception/gateway-exception.dto';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extract status code
    const status =
      typeof exception === 'object' &&
      exception !== null &&
      'status' in exception
        ? (exception as { status: number }).status
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log the exception if it's a server error (status code 5xx)
    if (status >= 500 && status < 600) {
      Logger.error(exception, 'ExceptionFilter');
    }

    // Safely extract message or validationErrors from the exception response
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

      // Check for validationErrors
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

    // Construct the error response
    const errorResponse: ResponseExceptionDto = {
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    response.status(status).json(errorResponse);
  }
}
