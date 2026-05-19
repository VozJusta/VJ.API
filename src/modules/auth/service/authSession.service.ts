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

    if (!sessionId) {
      throw new UnauthorizedException();
    }

    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session || !session.active) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}