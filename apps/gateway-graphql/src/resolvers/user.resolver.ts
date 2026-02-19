import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateUserDto,
  CreateUserResponseDto,
  ReadUserDto,
  ReadUserResponseDto,
} from '@contracts/auth/providers/users.dto';
import { UpdateUserDto } from '@contracts/auth/providers/users.dto';
import { UsersService } from '@contracts/auth/providers/users.service';
import type { AuthParamDto } from '@contracts/auth/providers/auth.dto';
import { Auth } from '@common-gateway/auth/gateway-auth.decorator';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { $Enums } from '@prisma/generated/auth';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Resolver('user')
export class UserResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => CreateUserResponseDto)
  public async userCreate(
    @Args('input') input: CreateUserDto,
    @Auth() auth: AuthParamDto,
  ): Promise<CreateUserResponseDto> {
    if (input.role) {
      const processedAuth = await this.authService.processAuthParam(auth);
      if (!processedAuth)
        throw new UnauthorizedException(
          'you must be logged in to set user role',
        );
      if (processedAuth.role != $Enums.Role.ADMIN)
        throw new ForbiddenException(
          'Only admins can set the role of a new user',
        );
    }

    return this.usersService.create(input);
  }

  @Query(() => [ReadUserResponseDto])
  public async userRead(
    @Args('input') input: ReadUserDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadUserResponseDto[]> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to see users');

    if (!input.id && !input.username) {
      if (processedAuth.role !== $Enums.Role.ADMIN)
        throw new ForbiddenException('only admins can see all users');
    }

    if (input.id) {
      if (
        processedAuth.role != $Enums.Role.ADMIN &&
        processedAuth.id != input.id
      )
        throw new ForbiddenException(
          'only admins can see all users, and users can only see their own account',
        );
    } else if (input.username) {
      if (
        processedAuth.role != $Enums.Role.ADMIN &&
        processedAuth.username != input.username
      )
        throw new ForbiddenException(
          'only admins can see all users, and users can only see their own account',
        );
    }

    return this.usersService.read(input.id, input.username);
  }

  @Mutation(() => ReadUserResponseDto)
  public async userUpdate(
    @Args('id') id: number,
    @Args('input') input: UpdateUserDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadUserResponseDto> {
    if (!input) throw new BadRequestException('no data provided to update');
    if (!input.role && !input.username && !input.password)
      throw new BadRequestException('no valid fields provided to update');

    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to update users');
    if (processedAuth.role != $Enums.Role.ADMIN && processedAuth.id != id)
      throw new ForbiddenException(
        'only admins can update all users, and users can only update their own account',
      );
    if (input.role && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('only admins can update user roles');

    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean)
  public async userDelete(
    @Args('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<boolean> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to delete users');
    if (processedAuth.role != $Enums.Role.ADMIN && processedAuth.id != id)
      throw new ForbiddenException(
        'only admins can delete all users, and users can only delete their own account',
      );

    await this.usersService.delete(id);
    return true;
  }
}
