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
    console.log('teste::: ',token);
    try {
      console.log('Verificando token...');
      const payload = this.jwtService.verify<tokenTypes>(token);
      console.log(payload);
      const { sub, role } = payload;
      if (role === 'Citizen') {
        const user = await this.prisma.citizen.findUnique({
          where: { id: sub },
          select: {
            id: true,
            full_name: true,
            subscription: {
              where: {
                user_id: sub,
              },
              select: {
                plan: {
                  select: {
                    type: true,
                  },
                },
              },
            },
          },
        });
        console.log('user:', user);
        return user;
      }
      return;
    } catch (err) {
      throw new BadRequestException('Token inválido');
    }
  }
}
