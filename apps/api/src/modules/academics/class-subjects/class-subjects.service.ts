import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@akaclass/database';

import { AssignSubjectDto } from './dto/assign-subject.dto';

@Injectable()
export class ClassSubjectsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async assignSubject(
    schoolId: string,
    classArmId: string,
    dto: AssignSubjectDto,
  ) {
    const classArm =
      await this.prisma.classArm.findFirst({
        where: {
          id: classArmId,
          classLevel: {
            schoolId,
          },
        },
      });

    if (!classArm) {
      throw new NotFoundException(
        'Class arm not found',
      );
    }

    const subject =
      await this.prisma.subject.findFirst({
        where: {
          id: dto.subjectId,
          schoolId,
        },
      });

    if (!subject) {
      throw new NotFoundException(
        'Subject not found',
      );
    }

    const existing =
      await this.prisma.classSubject.findUnique({
        where: {
          classArmId_subjectId: {
            classArmId,
            subjectId: dto.subjectId,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        'This subject is already assigned to this class arm',
      );
    }

    const classSubject =
      await this.prisma.classSubject.create({
        data: {
          classArmId,
          subjectId: dto.subjectId,
        },
        include: {
          subject: true,
          classArm: {
            include: {
              classLevel: true,
            },
          },
        },
      });

    return {
      message: 'Subject assigned successfully',
      classSubject,
    };
  }

  async findAll(
    schoolId: string,
    classArmId: string,
  ) {
    const classArm =
      await this.prisma.classArm.findFirst({
        where: {
          id: classArmId,
          classLevel: {
            schoolId,
          },
        },
      });

    if (!classArm) {
      throw new NotFoundException(
        'Class arm not found',
      );
    }

    return this.prisma.classSubject.findMany({
      where: {
        classArmId,
        classArm: {
          classLevel: {
            schoolId,
          },
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        subject: {
          name: 'asc',
        },
      },
    });
  }

  async removeSubject(
    schoolId: string,
    classArmId: string,
    subjectId: string,
  ) {
    const classArm =
      await this.prisma.classArm.findFirst({
        where: {
          id: classArmId,
          classLevel: {
            schoolId,
          },
        },
      });

    if (!classArm) {
      throw new NotFoundException(
        'Class arm not found',
      );
    }

    const assignment =
      await this.prisma.classSubject.findUnique({
        where: {
          classArmId_subjectId: {
            classArmId,
            subjectId,
          },
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Subject is not assigned to this class arm',
      );
    }

    await this.prisma.classSubject.delete({
      where: {
        classArmId_subjectId: {
          classArmId,
          subjectId,
        },
      },
    });

    return {
      message: 'Subject removed successfully',
    };
  }
}
