import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {
    return {
      message: 'Authenticated successfully',
      user,
    };
  }

  @Get('admin-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminTest(@CurrentUser() user: any) {
    return {
      message: 'Admin authorization successful',
      user,
    };
  }

  @Get('teacher-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  teacherTest(@CurrentUser() user: any) {
    return {
      message: 'Teacher authorization successful',
      user,
    };
  }

  @Get('parent-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT')
  parentTest(@CurrentUser() user: any) {
    return {
      message: 'Parent authorization successful',
      user,
    };
  }
}
