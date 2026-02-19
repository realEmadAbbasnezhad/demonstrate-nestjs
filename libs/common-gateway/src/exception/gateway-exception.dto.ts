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

export class GraphQLResponseExceptionDto extends ResponseExceptionDto {
  status: number;

  // required to allow additional properties in the extensions object of GraphQLError
  [key: string]: unknown;
}
