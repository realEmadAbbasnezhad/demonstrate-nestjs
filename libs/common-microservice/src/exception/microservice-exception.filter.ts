import { Catch, HttpStatus, Logger, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { MicroserviceExceptionDto } from './microservice-exception.dto';

@Catch()
export class MicroserviceExceptionFilter implements RpcExceptionFilter {
  catch(exception: any): Observable<any> {
    // extract status and message from exception, if they exist, otherwise use default values.
    const status: number =
      typeof exception === 'object' &&
      exception !== null &&
      'status' in exception
        ? (exception as { status: number }).status
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message: string =
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception
        ? (exception as { message: string }).message
        : 'Internal server error';

    // log the exception if it's a server error (status code 5xx)
    if (status >= 500 && status < 600) {
      Logger.error(exception, 'MicroserviceExceptionFilter');
    }

    return throwError(() => {
      return { status, message } as MicroserviceExceptionDto;
    });
  }
}
