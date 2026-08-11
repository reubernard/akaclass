import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@akaclass/database';

import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type UserListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
};

type UserDetails = UserListItem;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createUser(
    schoolId: string,
    dto: CreateUserDto,
  ) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        schoolId,
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists in this school',
      );
    }

    const role = await this.prisma.role.findUnique({
      where: {
        name: dto.role,
      },
    });

    if (!role) {
      throw new NotFoundException(
        `Role ${dto.role} does not exist`,
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      12,
    );

    const user = await this.prisma.$transaction(
      async (tx: any) => {
        const createdUser = await tx.user.create({
          data: {
            schoolId,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            email: normalizedEmail,
            passwordHash: hashedPassword,
          },
        });

        await tx.userRole.create({
          data: {
            userId: createdUser.id,
            roleId: role.id,
          },
        });

        return createdUser;
      },
    );

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        schoolId: user.schoolId,
        role: dto.role,
      },
    };
  }

  async findAll(schoolId: string): Promise<UserListItem[]> {
    const users = await this.prisma.user.findMany({
      where: {
        schoolId,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      ...user,
      roles: user.roles.map(
        (userRole) => userRole.role.name,
      ),
    }));
  }

  async findOne(
    schoolId: string,
    userId: string,
  ): Promise<UserDetails> { 
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        schoolId,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return {
      ...user,
      roles: user.roles.map(
        (userRole) => userRole.role.name,
      ),
    };
  }

  async updateUser(
    schoolId: string,
    currentUserId: string,
    userId: string,
    dto: UpdateUserDto,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        schoolId,
      },

      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (userId === currentUserId && dto.role) {
      throw new ForbiddenException(
        'You cannot change your own role',
      );
    }

    if (dto.email) {
      const normalizedEmail =
        dto.email.trim().toLowerCase();

      const existingUser =
        await this.prisma.user.findFirst({
          where: {
            schoolId,
            email: normalizedEmail,
            NOT: {
              id: userId,
            },
          },
        });

      if (existingUser) {
        throw new ConflictException(
          'A user with this email already exists in this school',
        );
      }
    }

    const updateData: any = {};

    if (dto.firstName !== undefined) {
      updateData.firstName =
        dto.firstName.trim();
    }

    if (dto.lastName !== undefined) {
      updateData.lastName =
        dto.lastName.trim();
    }

    if (dto.email !== undefined) {
      updateData.email =
        dto.email.trim().toLowerCase();
    }

    if (dto.phone !== undefined) {
      updateData.phone =
        dto.phone.trim();
    }

    if (dto.password !== undefined) {
      updateData.passwordHash =
        await bcrypt.hash(dto.password, 12);
    }

    const updatedUser =
      await this.prisma.$transaction(
        async (tx: any) => {
          const result =
            await tx.user.update({
              where: {
                id: userId,
              },
              data: updateData,
            });

          if (dto.role) {
            const role =
              await tx.role.findUnique({
                where: {
                  name: dto.role,
                },
              });

            if (!role) {
              throw new NotFoundException(
                `Role ${dto.role} does not exist`,
              );
            }

            await tx.userRole.deleteMany({
              where: {
                userId,
              },
            });

            await tx.userRole.create({
              data: {
                userId,
                roleId: role.id,
              },
            });
          }

          return result;
        },
      );

    return {
      message: 'User updated successfully',

      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        status: updatedUser.status,
      },
    };
  }

  async deactivateUser(
    schoolId: string,
    currentUserId: string,
    userId: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        schoolId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (userId === currentUserId) {
      throw new ForbiddenException(
        'You cannot deactivate your own account',
      );
    }

    if (user.status === 'INACTIVE') {
      return {
        message: 'User is already inactive',
      };
    }

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: 'INACTIVE',
      },
    });

    return {
      message: 'User deactivated successfully',
    };
  }
}