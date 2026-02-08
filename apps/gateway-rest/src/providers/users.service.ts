import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateUserDto,
  CreateUserResponseDto,
  FindUserDto,
  FindUserResponseDto,
  UpdateUserDto,
  UpdateUserMicroserviceDto,
} from '@contracts/microservice/auth/users.dto';
import { firstValueFrom } from 'rxjs';
import { AuthCommands } from '@contracts/microservice/auth/auth.commands';

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

  public findAll(): Promise<FindUserResponseDto[]> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersGet, {} as FindUserDto),
    );
  }

  public findOne(id: number): Promise<FindUserResponseDto> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersGet, { id } as FindUserDto),
    );
  }

  public update(id: number, body: UpdateUserDto): Promise<FindUserResponseDto> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersUpdate, {
        id,
        ...body,
      } as UpdateUserMicroserviceDto),
    );
  }

  public remove(id: number): Promise<void> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersDelete, id),
    );
  }
}
