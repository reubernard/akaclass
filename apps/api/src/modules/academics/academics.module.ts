import { Module } from '@nestjs/common';

import { PrismaModule } from '@akaclass/database';

import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';
import { ClassLevelsModule } from './class-levels/class-levels.module';
import { ClassSubjectsModule } from './class-subjects/class-subjects.module';

@Module({
  imports: [
    PrismaModule,
    ClassLevelsModule,
    ClassSubjectsModule,
  ],

  controllers: [
    AcademicsController,
  ],

  providers: [
    AcademicsService,
  ],

  exports: [
    AcademicsService,
  ],
})
export class AcademicsModule {}
