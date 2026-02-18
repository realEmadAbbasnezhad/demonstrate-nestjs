import { ValidationError } from 'class-validator';

export class ExceptionDto {
  validationErrors: ValidationError[] | undefined;
  message: string;
}

export class ResponseExceptionDto {
  message: string | { [key: string]: string | { [key: string]: string } };
  timestamp: string;
  path: string;
}
