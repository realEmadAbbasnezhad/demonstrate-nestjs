import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserDto,
  CreateUserResponseDto,
  ReadUserDto,
  ReadUserResponseDto,
} from '@contracts/microservice/auth/users.dto';
import { UpdateUserDto } from '@contracts/microservice/auth/users.dto';
import { UsersService } from '@contracts/auth/providers/users.service';
import type { AuthParamDto } from '@contracts/microservice/auth/auth.dto';
import { Auth } from '@gateway-rest/providers/auth/auth.decorator';
import { AuthService } from '@contracts/auth/providers/auth.service';
import { $Enums } from '@prisma/generated/auth';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'create a new user account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success',
    type: CreateUserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You must be logged in to set user role',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins can set the role of a new user',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username already exists',
  })
  @Post()
  public async create(
    @Body() body: CreateUserDto,
    @Auth() auth: AuthParamDto,
  ): Promise<CreateUserResponseDto> {
    if (body.role) {
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

    return this.usersService.create(body);
  }

  @ApiOperation({ summary: 'get a user account or all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: ReadUserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You must be logged in to see users',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins or the user themself can see this user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @Get()
  public async read(
    @Query() query: ReadUserDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadUserResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to see users');

    if (!query.id && !query.username) {
      if (processedAuth.role !== $Enums.Role.ADMIN)
        throw new ForbiddenException('only admins can see all users');
    }

    if (query.id) {
      query.id = Number(query.id);
      if (
        processedAuth.role != $Enums.Role.ADMIN &&
        processedAuth.id != query.id
      )
        throw new ForbiddenException(
          'only admins can see all users, and users can only see their own account',
        );
    } else if (query.username) {
      if (
        processedAuth.role != $Enums.Role.ADMIN &&
        processedAuth.username != query.username
      )
        throw new ForbiddenException(
          'only admins can see all users, and users can only see their own account',
        );
    }

    return this.usersService.read(query.id, query.username);
  }

  @ApiOperation({ summary: 'update a user accounts' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: ReadUserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No valid fields provided to update',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You must be logged in to update users',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins or the user themself can update this user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @Patch(':id')
  public async update(
    @Param('id') id: number,
    @Body() body: UpdateUserDto,
    @Auth() auth: AuthParamDto,
  ): Promise<ReadUserResponseDto> {
    if (!body) throw new BadRequestException('no data provided to update');
    if (!body.role && !body.username && !body.password)
      throw new BadRequestException('no valid fields provided to update');

    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to update users');
    if (processedAuth.role != $Enums.Role.ADMIN && processedAuth.id != id)
      throw new ForbiddenException(
        'only admins can update all users, and users can only update their own account',
      );
    if (body.role && processedAuth.role != $Enums.Role.ADMIN)
      throw new ForbiddenException('only admins can update user roles');

    return this.usersService.update(id, body);
  }

  @ApiOperation({ summary: 'delete a user account' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Success' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You must be logged in to delete users',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins or the user themself can delete this user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @Param('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<void> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to delete users');
    if (processedAuth.role != $Enums.Role.ADMIN && processedAuth.id != id)
      throw new ForbiddenException(
        'only admins can delete all users, and users can only delete their own account',
      );

    return this.usersService.delete(id);
  }
}
