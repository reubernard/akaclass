import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  createUser(
    @Req() req: any,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.createUser(
      req.user.schoolId,
      dto,
    );
  }

  @Get()
  findAll(@Req() req: any): Promise<unknown> {
    return this.usersService.findAll(
      req.user.schoolId,
    );
  }

  @Get(':id')
  findOne(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.usersService.findOne(
      req.user.schoolId,
      id,
    );
  }

  @Patch(':id')
  updateUser(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(
      req.user.schoolId,
      req.user.id,
      id,
      dto,
    );
  }

  @Delete(':id')
  deactivateUser(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.usersService.deactivateUser(
      req.user.schoolId,
      req.user.id,
      id,
    );
  }
}