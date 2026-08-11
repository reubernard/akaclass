import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ClassSubjectsService } from './class-subjects.service';

import { AssignSubjectDto } from './dto/assign-subject.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('academics/class-arms/:classArmId/subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ClassSubjectsController {
  constructor(
    private readonly classSubjectsService: ClassSubjectsService,
  ) {}

  @Post()
  assignSubject(
    @Req() req: any,
    @Param('classArmId') classArmId: string,
    @Body() dto: AssignSubjectDto,
  ) {
    return this.classSubjectsService.assignSubject(
      req.user.schoolId,
      classArmId,
      dto,
    );
  }

  @Get()
  findAll(
    @Req() req: any,
    @Param('classArmId') classArmId: string,
  ) {
    return this.classSubjectsService.findAll(
      req.user.schoolId,
      classArmId,
    );
  }

  @Delete(':subjectId')
  removeSubject(
    @Req() req: any,
    @Param('classArmId') classArmId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.classSubjectsService.removeSubject(
      req.user.schoolId,
      classArmId,
      subjectId,
    );
  }
}
