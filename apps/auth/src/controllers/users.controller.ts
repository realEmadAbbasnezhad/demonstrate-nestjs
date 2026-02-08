import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthCommands } from '@contracts/microservice/auth/auth.commands';
import { UsersService } from '../providers/users.service';
import {
  CreateUserDto,
  CreateUserResponseDto,
  FindUserDto,
  FindUserResponseDto,
  type UpdateUserMicroserviceDto,
} from '@contracts/microservice/auth/users.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(AuthCommands.UsersCreate)
  async create(
    @Payload() payload: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return this.usersService.create(payload);
  }

  @MessagePattern(AuthCommands.UsersGet)
  async find(@Payload() payload: FindUserDto): Promise<FindUserResponseDto[]> {
    payload.id = Number(payload.id);
    return this.usersService.find(payload);
  }

  @MessagePattern(AuthCommands.UsersUpdate)
  async update(
    @Payload() payload: UpdateUserMicroserviceDto,
  ): Promise<FindUserResponseDto> {
    return this.usersService.update(Number(payload.id), payload);
  }

  @MessagePattern(AuthCommands.UsersDelete)
  async remove(id: number): Promise<null> {
    return this.usersService.remove(Number(id));
  }
}
