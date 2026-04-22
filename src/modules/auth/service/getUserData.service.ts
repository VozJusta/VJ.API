import { PrismaService } from '@modules/prisma/service/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { tokenTypes } from '@m/auth/interfaces/interfaces';

export class GetUserDataService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private extractBearerToken(accessToken: string): string {
    const normalizedToken = accessToken?.trim();
    const match = normalizedToken?.match(/^Bearer\s+(.+)$/i);

    if (!match || !match[1]?.trim()) {
      throw new BadRequestException('Token inválido');
    }

    return match[1].trim();
  }

  async getUserData(accessToken: string) {
    try {
      const clearToken = this.extractBearerToken(accessToken);
      const payload = this.jwtService.verify<tokenTypes>(clearToken);
      const { sub, role, sessionId } = payload;
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

        if (!user || user.session_id !== sessionId) {
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

        if (!user || user.session_id !== sessionId) {
          throw new BadRequestException('Token inválido');
        }

        return user;
      }
    } catch (err) {
      throw new BadRequestException('Token inválido');
    }
  }
}
