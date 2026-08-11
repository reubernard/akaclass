import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { PrismaService } from '@akaclass/database';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedSchoolName = dto.schoolName.trim();

    const existingSchool = await this.prisma.school.findFirst({
      where: {
        name: {
          equals: normalizedSchoolName,
          mode: 'insensitive',
        },
      },
    });

    if (existingSchool) {
      throw new ConflictException(
        'A school with this name is already registered',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx: any) => {
      const school = await tx.school.create({
        data: {
          name: normalizedSchoolName,
          code:
            normalizedSchoolName
              .toUpperCase()
              .replace(/\s/g, '')
              .substring(0, 10) + Date.now(),
        },
      });

      const user = await tx.user.create({
        data: {
          schoolId: school.id,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: normalizedEmail,
          passwordHash: hashedPassword,
        },
      });

      const role = await tx.role.findUnique({
        where: {
          name: 'ADMIN',
        },
      });

      if (!role) {
        throw new Error('ADMIN role has not been seeded');
      }

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      return { user, school };
    });

    const token = await this.jwtService.signAsync({
      sub: result.user.id,
      email: result.user.email,
      schoolId: result.school.id,
    });

    return {
      message: 'Registration successful',
      accessToken: token,

      school: {
        id: result.school.id,
        name: result.school.name,
        code: result.school.code,
      },

      user: {
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        schoolId: result.school.id,
      },
    };
  }

  async login(dto: LoginDto) {
    const school = await this.prisma.school.findUnique({
      where: {
        code: dto.schoolCode.trim().toUpperCase(),
      },
    });

    if (!school) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        schoolId: school.id,
        email: dto.email.trim().toLowerCase(),
      },

      include: {
        school: true,

        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      schoolId: user.schoolId,
      roles: user.roles.map((userRole: any) => userRole.role.name),
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        school: user.school.name,
        schoolCode: user.school.code,
        roles: user.roles.map(
          (userRole: any) => userRole.role.name,
        ),
      },
    };
  }
}
