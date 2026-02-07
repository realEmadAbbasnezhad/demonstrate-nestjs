import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateUserDto,
  CreateUserResponseDto,
  FindUserDto,
  FindUserResponseDto,
  UpdateUserDto,
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

  findAll(): Promise<FindUserResponseDto[]> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersGet, {} as FindUserDto),
    );
  }

  findOne(id: number): Promise<FindUserResponseDto> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersGet, { id } as FindUserDto),
    );
  }

  update(id: number, body: UpdateUserDto): Promise<FindUserResponseDto> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersUpdate, body),
    );
  }

  remove(id: number): Promise<void> {
    return firstValueFrom(
      this.authMicroservice.send(AuthCommands.UsersDelete, {
        id,
      } as FindUserDto),
    );
  }
}
