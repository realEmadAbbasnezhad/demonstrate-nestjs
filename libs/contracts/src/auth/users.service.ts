import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateUserDto,
  CreateUserResponseDto,
  ReadUserDto,
  ReadUserResponseDto,
  UpdateUserDto,
  UpdateUserMicroserviceDto,
} from './users.dto';
import { firstValueFrom } from 'rxjs';
import { AuthCommands } from './auth.commands';

@Injectable()
export class UsersService {
  constructor(
    @Inject('AUTH_MICROSERVICE')
    private readonly authMicroservice: ClientProxy,
  ) {}

  public create(body: CreateUserDto): Promise<CreateUserResponseDto> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersCreate, body),
    );
  }

  public read(
    id: number | undefined,
    username: string | undefined,
  ): Promise<ReadUserResponseDto> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersRead, {
        id,
        username,
      } as ReadUserDto),
    );
  }

  public update(id: number, body: UpdateUserDto): Promise<ReadUserResponseDto> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersUpdate, {
        id,
        ...body,
      } as UpdateUserMicroserviceDto),
    );
  }

  public delete(id: number): Promise<void> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersDelete, id),
    );
  }
}
