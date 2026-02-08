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
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserDto,
  CreateUserResponseDto,
  FindUserResponseDto,
} from '@contracts/microservice/auth/users.dto';
import { UpdateUserDto } from '@contracts/microservice/auth/users.dto';
import { UsersService } from '@gateway-rest/providers/users.service';
import type { AuthParamDto } from '@contracts/microservice/auth/auth.dto';
import { Auth } from '@gateway-rest/providers/auth/auth.decorator';
import { AuthService } from '@gateway-rest/providers/auth/auth.service';
import { $Enums } from '@prisma/generated/auth';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'create a new user account' })
  @Post()
  async create(
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

  @ApiOperation({ summary: 'get all user accounts' })
  @Get()
  async findAll(@Auth() auth: AuthParamDto): Promise<FindUserResponseDto[]> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to see users');
    if (processedAuth.role !== $Enums.Role.ADMIN)
      throw new ForbiddenException('only admins can see all users');

    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'get a user accounts' })
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Auth() auth: AuthParamDto,
  ): Promise<FindUserResponseDto> {
    const processedAuth = await this.authService.processAuthParam(auth);
    if (!processedAuth)
      throw new UnauthorizedException('you must be logged in to see users');
    if (processedAuth.role != $Enums.Role.ADMIN && processedAuth.id != id)
      throw new ForbiddenException(
        'only admins can see all users, and users can only see their own account',
      );

    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'update a user accounts' })
  @ApiBody({ type: UpdateUserDto })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() body: UpdateUserDto,
    @Auth() auth: AuthParamDto,
  ): Promise<FindUserResponseDto> {
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
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
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

    return this.usersService.remove(id);
  }
}
