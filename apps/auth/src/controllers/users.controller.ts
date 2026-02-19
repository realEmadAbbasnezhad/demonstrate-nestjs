import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthCommands } from '@contracts/auth/auth.commands';
import { UsersService } from '@auth/providers/users.service';
import {
  CreateUserDto,
  CreateUserResponseDto,
  ReadUserDto,
  ReadUserResponseDto,
  type UpdateUserMicroserviceDto,
} from '@contracts/auth/providers/users.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(AuthCommands.UsersCreate)
  public async create(
    @Payload() payload: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return this.usersService.create(payload);
  }

  @MessagePattern(AuthCommands.UsersRead)
  public async read(
    @Payload() payload: ReadUserDto,
  ): Promise<ReadUserResponseDto[]> {
    payload.id = Number(payload.id);
    return this.usersService.read(payload);
  }

  @MessagePattern(AuthCommands.UsersUpdate)
  public async update(
    @Payload() payload: UpdateUserMicroserviceDto,
  ): Promise<ReadUserResponseDto> {
    return this.usersService.update(Number(payload.id), payload);
  }

  @MessagePattern(AuthCommands.UsersDelete)
  public async delete(id: number): Promise<null> {
    return this.usersService.delete(Number(id));
  }
}
