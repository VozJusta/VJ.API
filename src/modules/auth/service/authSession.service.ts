import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateAccessToken(token: string) {
    const payload = this.jwtService.verify(token, {
      audience: 'access',
      issuer: 'api',
    });

    const sessionId = payload.sessionId ?? payload.session_id;
    const userId = payload.sub;
    const role = payload.role;

    if (!sessionId || !userId) {
      throw new UnauthorizedException();
    }

    if (role === 'Citizen') {
      const citizen = await this.prisma.citizen.findUnique({
        where: { id: userId },
        select: { session_id: true },
      });

      if (!citizen || citizen.session_id !== sessionId) {
        throw new UnauthorizedException();
      }
    } else if (role === 'Lawyer') {
      const lawyer = await this.prisma.lawyer.findUnique({
        where: { id: userId },
        select: { session_id: true },
      });

      if (!lawyer || lawyer.session_id !== sessionId) {
        throw new UnauthorizedException();
      }
    } else {
      throw new UnauthorizedException();
    }

    return payload;
  }
}