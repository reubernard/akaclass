import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@akaclass/database';

import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { CreateClassLevelDto } from './dto/create-class-level.dto';
import { UpdateClassLevelDto } from './dto/update-class-level.dto';
import { CreateClassArmDto } from './dto/create-class-arm.dto';
import { UpdateClassArmDto } from './dto/update-class-arm.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class AcademicsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createSession(
    schoolId: string,
    dto: CreateSessionDto,
  ) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Session start date must be before the end date',
      );
    }

    const existingSession =
      await this.prisma.academicSession.findFirst({
        where: {
          schoolId,
          name: dto.name.trim(),
        },
      });

    if (existingSession) {
      throw new ConflictException(
        'An academic session with this name already exists',
      );
    }

    const session =
      await this.prisma.academicSession.create({
        data: {
          schoolId,
          name: dto.name.trim(),
          startDate,
          endDate,
        },
      });

    return {
      message: 'Academic session created successfully',
      session,
    };
  }

  async getSessions(schoolId: string) {
    return this.prisma.academicSession.findMany({
      where: {
        schoolId,
      },
      include: {
        terms: {
          orderBy: {
            startDate: 'asc',
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async getSession(
    schoolId: string,
    sessionId: string,
  ) {
    const session =
      await this.prisma.academicSession.findFirst({
        where: {
          id: sessionId,
          schoolId,
        },
        include: {
          terms: {
            orderBy: {
              startDate: 'asc',
            },
          },
        },
      });

    if (!session) {
      throw new NotFoundException(
        'Academic session not found',
      );
    }

    return session;
  }

  async updateSession(
    schoolId: string,
    sessionId: string,
    dto: UpdateSessionDto,
  ) {
    const existing =
      await this.prisma.academicSession.findFirst({
        where: {
          id: sessionId,
          schoolId,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Academic session not found',
      );
    }

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : existing.startDate;

    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : existing.endDate;

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Session start date must be before the end date',
      );
    }

    if (
      dto.name &&
      dto.name.trim() !== existing.name
    ) {
      const duplicate =
        await this.prisma.academicSession.findFirst({
          where: {
            schoolId,
            name: dto.name.trim(),
            NOT: {
              id: sessionId,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'An academic session with this name already exists',
        );
      }
    }

    if (dto.isCurrent === true) {
      await this.prisma.$transaction([
        this.prisma.academicSession.updateMany({
          where: {
            schoolId,
            id: {
              not: sessionId,
            },
          },
          data: {
            isCurrent: false,
          },
        }),

        this.prisma.academicSession.update({
          where: {
            id: sessionId,
          },
          data: {
            ...(dto.name !== undefined && {
              name: dto.name.trim(),
            }),
            startDate,
            endDate,
            isCurrent: true,
          },
        }),
      ]);
    } else {
      await this.prisma.academicSession.update({
        where: {
          id: sessionId,
        },
        data: {
          ...(dto.name !== undefined && {
            name: dto.name.trim(),
          }),
          startDate,
          endDate,
          ...(dto.isCurrent !== undefined && {
            isCurrent: dto.isCurrent,
          }),
        },
      });
    }

    return {
      message: 'Academic session updated successfully',
      session: await this.getSession(
        schoolId,
        sessionId,
      ),
    };
  }

  async createTerm(
    schoolId: string,
    sessionId: string,
    dto: CreateTermDto,
  ) {
    const session =
      await this.prisma.academicSession.findFirst({
        where: {
          id: sessionId,
          schoolId,
        },
      });

    if (!session) {
      throw new NotFoundException(
        'Academic session not found',
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Term start date must be before the end date',
      );
    }

    if (
      startDate < session.startDate ||
      endDate > session.endDate
    ) {
      throw new BadRequestException(
        'Term dates must fall within the academic session dates',
      );
    }

    const existingTerm =
      await this.prisma.academicTerm.findFirst({
        where: {
          sessionId,
          name: dto.name.trim(),
        },
      });

    if (existingTerm) {
      throw new ConflictException(
        'A term with this name already exists in this session',
      );
    }

    const term =
      await this.prisma.academicTerm.create({
        data: {
          sessionId,
          name: dto.name.trim(),
          startDate,
          endDate,
        },
      });

    return {
      message: 'Academic term created successfully',
      term,
    };
  }

  async getTerms(
    schoolId: string,
    sessionId: string,
  ) {
    const session =
      await this.prisma.academicSession.findFirst({
        where: {
          id: sessionId,
          schoolId,
        },
      });

    if (!session) {
      throw new NotFoundException(
        'Academic session not found',
      );
    }

    return this.prisma.academicTerm.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async updateTerm(
    schoolId: string,
    sessionId: string,
    termId: string,
    dto: UpdateTermDto,
  ) {
    const session =
      await this.prisma.academicSession.findFirst({
        where: {
          id: sessionId,
          schoolId,
        },
      });

    if (!session) {
      throw new NotFoundException(
        'Academic session not found',
      );
    }

    const existing =
      await this.prisma.academicTerm.findFirst({
        where: {
          id: termId,
          sessionId,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Academic term not found',
      );
    }

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : existing.startDate;

    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : existing.endDate;

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Term start date must be before the end date',
      );
    }

    if (
      startDate < session.startDate ||
      endDate > session.endDate
    ) {
      throw new BadRequestException(
        'Term dates must fall within the academic session dates',
      );
    }

    const term =
      await this.prisma.academicTerm.update({
        where: {
          id: termId,
        },
        data: {
          ...(dto.name !== undefined && {
            name: dto.name.trim(),
          }),
          startDate,
          endDate,
        },
      });

    return {
      message: 'Academic term updated successfully',
      term,
    };
  }


  async createClassLevel(
  schoolId: string,
  dto: CreateClassLevelDto,
) {
  const name = dto.name.trim();

  const existing = await this.prisma.classLevel.findFirst({
    where: {
      schoolId,
      name,
    },
  });

  if (existing) {
    throw new ConflictException(
      'A class level with this name already exists',
    );
  }

  const classLevel = await this.prisma.classLevel.create({
    data: {
      schoolId,
      name,
      order: dto.order,
    },
  });

  return {
    message: 'Class level created successfully',
    classLevel,
  };
}

async getClassLevels(schoolId: string) {
  return this.prisma.classLevel.findMany({
    where: {
      schoolId,
    },
    include: {
      arms: {
        orderBy: {
          name: 'asc',
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });
}

  async getClassLevel(
    schoolId: string,
    classLevelId: string,
  ) {
    const classLevel = await this.prisma.classLevel.findFirst({
      where: {
        id: classLevelId,
        schoolId,
      },
      include: {
        arms: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!classLevel) {
      throw new NotFoundException(
        'Class level not found',
      );
    }

    return classLevel;
  }

  async updateClassLevel(
    schoolId: string,
    classLevelId: string,
    dto: UpdateClassLevelDto,
  ) {
    const existing = await this.prisma.classLevel.findFirst({
      where: {
        id: classLevelId,
        schoolId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'Class level not found',
      );
    }

    const name =
      dto.name !== undefined
        ? dto.name.trim()
        : existing.name;

    if (name !== existing.name) {
      const duplicate =
        await this.prisma.classLevel.findFirst({
          where: {
            schoolId,
            name,
            NOT: {
              id: classLevelId,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'A class level with this name already exists',
        );
      }
    }

    const classLevel =
      await this.prisma.classLevel.update({
        where: {
          id: classLevelId,
        },
        data: {
          name,
          ...(dto.order !== undefined && {
            order: dto.order,
          }),
        },
      });

    return {
      message: 'Class level updated successfully',
      classLevel,
    };
  }


  async createClassArm(
    schoolId: string,
    classLevelId: string,
    dto: CreateClassArmDto,
  ) {
    const classLevel =
      await this.prisma.classLevel.findFirst({
        where: {
          id: classLevelId,
          schoolId,
        },
      });

    if (!classLevel) {
      throw new NotFoundException(
        'Class level not found',
      );
    }

    const name = dto.name.trim();
    const code = dto.code.trim().toUpperCase();

    const existing =
      await this.prisma.classArm.findFirst({
        where: {
          classLevelId,
          code,
        },
      });

    if (existing) {
      throw new ConflictException(
        'A class arm with this code already exists in this class level',
      );
    }

    const classArm =
      await this.prisma.classArm.create({
        data: {
          classLevelId,
          name,
          code,
        },
      });

    return {
      message: 'Class arm created successfully',
      classArm,
    };
  }

  async getClassArms(
    schoolId: string,
    classLevelId: string,
  ) {
    const classLevel =
      await this.prisma.classLevel.findFirst({
        where: {
          id: classLevelId,
          schoolId,
        },
      });

    if (!classLevel) {
      throw new NotFoundException(
        'Class level not found',
      );
    }

    return this.prisma.classArm.findMany({
      where: {
        classLevelId,
      },
      include: {
        classLevel: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getClassArm(
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

    return this.prisma.classArm.findFirst({
      where: {
        id: classArmId,
      },
      include: {
        classLevel: true,
      },
    });
  }

  async updateClassArm(
    schoolId: string,
    classArmId: string,
    dto: UpdateClassArmDto,
  ) {
    const existing =
      await this.prisma.classArm.findFirst({
        where: {
          id: classArmId,
          classLevel: {
            schoolId,
          },
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Class arm not found',
      );
    }

    const name =
      dto.name !== undefined
        ? dto.name.trim()
        : existing.name;

    const code =
      dto.code !== undefined
        ? dto.code.trim().toUpperCase()
        : existing.code;

    if (code !== existing.code) {
      const duplicate =
        await this.prisma.classArm.findFirst({
          where: {
            classLevelId: existing.classLevelId,
            code,
            NOT: {
              id: classArmId,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'A class arm with this code already exists in this class level',
        );
      }
    }

    const classArm =
      await this.prisma.classArm.update({
        where: {
          id: classArmId,
        },
        data: {
          name,
          code,
        },
      });

    return {
      message: 'Class arm updated successfully',
      classArm,
    };
  }

  async createSubject(
    schoolId: string,
    dto: CreateSubjectDto,
  ) {
    const name = dto.name.trim();
    const code = dto.code.trim().toUpperCase();

    const existing =
      await this.prisma.subject.findFirst({
        where: {
          schoolId,
          code,
        },
      });

    if (existing) {
      throw new ConflictException(
        'A subject with this code already exists',
      );
    }

    const subject =
      await this.prisma.subject.create({
        data: {
          schoolId,
          name,
          code,
          isCore: dto.isCore ?? false,
        },
      });

    return {
      message: 'Subject created successfully',
      subject,
    };
  }

  async getSubjects(schoolId: string) {
    return this.prisma.subject.findMany({
      where: {
        schoolId,
      },
      include: {
        classSubjects: {
          include: {
            classArm: {
              include: {
                classLevel: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getSubject(
    schoolId: string,
    subjectId: string,
  ) {
    const subject =
      await this.prisma.subject.findFirst({
        where: {
          id: subjectId,
          schoolId,
        },
        include: {
          classSubjects: {
            include: {
              classArm: {
                include: {
                  classLevel: true,
                },
              },
            },
          },
        },
      });

    if (!subject) {
      throw new NotFoundException(
        'Subject not found',
      );
    }

    return subject;
  }

  async updateSubject(
    schoolId: string,
    subjectId: string,
    dto: UpdateSubjectDto,
  ) {
    const existing =
      await this.prisma.subject.findFirst({
        where: {
          id: subjectId,
          schoolId,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Subject not found',
      );
    }

    const name =
      dto.name !== undefined
        ? dto.name.trim()
        : existing.name;

    const code =
      dto.code !== undefined
        ? dto.code.trim().toUpperCase()
        : existing.code;

    if (code !== existing.code) {
      const duplicate =
        await this.prisma.subject.findFirst({
          where: {
            schoolId,
            code,
            NOT: {
              id: subjectId,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'A subject with this code already exists',
        );
      }
    }

    const subject =
      await this.prisma.subject.update({
        where: {
          id: subjectId,
        },
        data: {
          name,
          code,
          ...(dto.isCore !== undefined && {
            isCore: dto.isCore,
          }),
        },
      });

    return {
      message: 'Subject updated successfully',
      subject,
    };
  }
}
