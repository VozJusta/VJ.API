import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface tokenTypes {
  sub: string;
  role: 'Citizen' | 'Lawyer';
  email: string;
  fullName: string;
}

@Controller()
export class userDataController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Get('/me')
  @HttpCode(200)
  async getUserData(@Headers('token') token: string) {
    try {
      const payload = this.jwtService.verify<tokenTypes>(token);
      const { sub, role } = payload;
      if (role === 'Citizen') {
        const user = await this.prisma.citizen.findUnique({
          where: { id: sub },
          select: {
            id: true,
            full_name: true,
          },
        });
      }

      return payload;
    } catch (err) {
      throw new BadRequestException('Token inválido');
    }
  }
}
