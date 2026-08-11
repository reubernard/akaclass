import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@akaclass/database';

import { CreateClassLevelDto } from './dto/create-class-level.dto';
import { UpdateClassLevelDto } from './dto/update-class-level.dto';

@Injectable()
export class ClassLevelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateClassLevelDto) {
    const existing = await this.prisma.classLevel.findUnique({
      where: {
        schoolId_name: {
          schoolId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'A class level with this name already exists',
      );
    }

    return this.prisma.classLevel.create({
      data: {
        schoolId,
        name: dto.name,
        order: dto.order,
      },
      include: {
        arms: true,
      },
    });
  }

  async findAll(schoolId: string) {
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

  async findOne(schoolId: string, id: string) {
    const classLevel = await this.prisma.classLevel.findFirst({
      where: {
        id,
        schoolId,
      },
      include: {
        arms: {
          orderBy: {
            name: 'asc',
          },
          include: {
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!classLevel) {
      throw new NotFoundException('Class level not found');
    }

    return classLevel;
  }

  async update(
    schoolId: string,
    id: string,
    dto: UpdateClassLevelDto,
  ) {
    const existing = await this.prisma.classLevel.findFirst({
      where: {
        id,
        schoolId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Class level not found');
    }

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.prisma.classLevel.findUnique({
        where: {
          schoolId_name: {
            schoolId,
            name: dto.name,
          },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'A class level with this name already exists',
        );
      }
    }

    return this.prisma.classLevel.update({
      where: {
        id,
      },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
      include: {
        arms: true,
      },
    });
  }

  async remove(schoolId: string, id: string) {
    const existing = await this.prisma.classLevel.findFirst({
      where: {
        id,
        schoolId,
      },
      include: {
        arms: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Class level not found');
    }

    if (existing.arms.length > 0) {
      throw new ConflictException(
        'Cannot delete a class level that contains class arms',
      );
    }

    await this.prisma.classLevel.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Class level deleted successfully',
    };
  }
}