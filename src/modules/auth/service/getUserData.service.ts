import { PrismaService } from '@modules/prisma/service/prisma.service';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class GetUserDataService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async getUserData(sub: string, role: string) {

    try {
      if (!sub || !role) {
        throw new BadRequestException('Token inválido');
      }
      if (role === 'Citizen') {
        const user = await this.prisma.citizen.findUnique({
          where: { id: sub },
          select: {
            id: true,
            full_name: true,
            session_id: true,
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

        if (!user) {
          throw new BadRequestException('Token inválido');
        }

        return user;
      } else {
        const user = await this.prisma.lawyer.findUnique({
          where: { id: sub },
          select: {
            id: true,
            full_name: true,
            avatar_image: true,
            session_id: true,
            subscription: {
              where: {
                lawyer_id: sub,
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

        if (!user) {
          throw new BadRequestException('Token inválido');
        }

        return user;
      }
    } catch (err) {
      throw new BadRequestException('Erro ao validar token');
    }
  }
}
