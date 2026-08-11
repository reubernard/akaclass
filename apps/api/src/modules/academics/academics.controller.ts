import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AcademicsService } from './academics.service';
import { CreateClassLevelDto } from './dto/create-class-level.dto';
import { UpdateClassLevelDto } from './dto/update-class-level.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { CreateClassArmDto } from './dto/create-class-arm.dto';
import { UpdateClassArmDto } from './dto/update-class-arm.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Controller('academics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicsController {
  constructor(
    private readonly academicsService: AcademicsService,
  ) {}

  @Post('sessions')
  @Roles('ADMIN')
  createSession(
    @Req() req: any,
    @Body() dto: CreateSessionDto,
  ) {
    return this.academicsService.createSession(
      req.user.schoolId,
      dto,
    );
  }

  @Get('sessions')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getSessions(@Req() req: any) {
    return this.academicsService.getSessions(
      req.user.schoolId,
    );
  }

  @Get('sessions/:sessionId')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getSession(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
  ) {
    return this.academicsService.getSession(
      req.user.schoolId,
      sessionId,
    );
  }

  @Patch('sessions/:sessionId')
  @Roles('ADMIN')
  updateSession(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.academicsService.updateSession(
      req.user.schoolId,
      sessionId,
      dto,
    );
  }

  @Post('sessions/:sessionId/terms')
  @Roles('ADMIN')
  createTerm(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateTermDto,
  ) {
    return this.academicsService.createTerm(
      req.user.schoolId,
      sessionId,
      dto,
    );
  }

  @Get('sessions/:sessionId/terms')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getTerms(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
  ) {
    return this.academicsService.getTerms(
      req.user.schoolId,
      sessionId,
    );
  }

  @Patch(
    'sessions/:sessionId/terms/:termId',
  )
  @Roles('ADMIN')
  updateTerm(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Param('termId') termId: string,
    @Body() dto: UpdateTermDto,
  ) {
    return this.academicsService.updateTerm(
      req.user.schoolId,
      sessionId,
      termId,
      dto,
    );
  }

  @Post('class-levels')
  @Roles('ADMIN')
  createClassLevel(
    @Req() req: any,
    @Body() dto: CreateClassLevelDto,
  ) {
    return this.academicsService.createClassLevel(
      req.user.schoolId,
      dto,
    );
  }

  @Get('class-levels')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getClassLevels(@Req() req: any) {
    return this.academicsService.getClassLevels(
      req.user.schoolId,
    );
  }

  @Get('class-levels/:classLevelId')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getClassLevel(
    @Req() req: any,
    @Param('classLevelId') classLevelId: string,
  ) {
    return this.academicsService.getClassLevel(
      req.user.schoolId,
      classLevelId,
    );
  }

  @Patch('class-levels/:classLevelId')
  @Roles('ADMIN')
  updateClassLevel(
    @Req() req: any,
    @Param('classLevelId') classLevelId: string,
    @Body() dto: UpdateClassLevelDto,
  ) {
    return this.academicsService.updateClassLevel(
      req.user.schoolId,
      classLevelId,
      dto,
    );
  }


  @Post('class-levels/:classLevelId/arms')
  @Roles('ADMIN')
  createClassArm(
    @Req() req: any,
    @Param('classLevelId') classLevelId: string,
    @Body() dto: CreateClassArmDto,
  ) {
    return this.academicsService.createClassArm(
      req.user.schoolId,
      classLevelId,
      dto,
    );
  }

  @Get('class-levels/:classLevelId/arms')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getClassArms(
    @Req() req: any,
    @Param('classLevelId') classLevelId: string,
  ) {
    return this.academicsService.getClassArms(
      req.user.schoolId,
      classLevelId,
    );
  }

  @Get('class-arms/:classArmId')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getClassArm(
    @Req() req: any,
    @Param('classArmId') classArmId: string,
  ) {
    return this.academicsService.getClassArm(
      req.user.schoolId,
      classArmId,
    );
  }

  @Patch('class-arms/:classArmId')
  @Roles('ADMIN')
  updateClassArm(
    @Req() req: any,
    @Param('classArmId') classArmId: string,
    @Body() dto: UpdateClassArmDto,
  ) {
    return this.academicsService.updateClassArm(
      req.user.schoolId,
      classArmId,
      dto,
    );
  }

  @Post('subjects')
  @Roles('ADMIN')
  createSubject(
    @Req() req: any,
    @Body() dto: CreateSubjectDto,
  ) {
    return this.academicsService.createSubject(
      req.user.schoolId,
      dto,
    );
  }

  @Get('subjects')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getSubjects(@Req() req: any) {
    return this.academicsService.getSubjects(
      req.user.schoolId,
    );
  }

  @Get('subjects/:subjectId')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getSubject(
    @Req() req: any,
    @Param('subjectId') subjectId: string,
  ) {
    return this.academicsService.getSubject(
      req.user.schoolId,
      subjectId,
    );
  }

  @Patch('subjects/:subjectId')
  @Roles('ADMIN')
  updateSubject(
    @Req() req: any,
    @Param('subjectId') subjectId: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.academicsService.updateSubject(
      req.user.schoolId,
      subjectId,
      dto,
    );
  }
}
