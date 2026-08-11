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

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { ClassLevelsService } from './class-levels.service';
import { CreateClassLevelDto } from './dto/create-class-level.dto';
import { UpdateClassLevelDto } from './dto/update-class-level.dto';

@Controller('academics/class-levels')
@UseGuards(JwtAuthGuard)
export class ClassLevelsController {
  constructor(
    private readonly classLevelsService: ClassLevelsService,
  ) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() dto: CreateClassLevelDto,
  ) {
    const classLevel = await this.classLevelsService.create(
      req.user.schoolId,
      dto,
    );

    return {
      message: 'Class level created successfully',
      classLevel,
    };
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.classLevelsService.findAll(req.user.schoolId);
  }

  @Get(':id')
  async findOne(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.classLevelsService.findOne(
      req.user.schoolId,
      id,
    );
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateClassLevelDto,
  ) {
    const classLevel = await this.classLevelsService.update(
      req.user.schoolId,
      id,
      dto,
    );

    return {
      message: 'Class level updated successfully',
      classLevel,
    };
  }

  @Delete(':id')
  async remove(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.classLevelsService.remove(
      req.user.schoolId,
      id,
    );
  }
}