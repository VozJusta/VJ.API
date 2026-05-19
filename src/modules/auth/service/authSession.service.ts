import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigType } from "@nestjs/config";
import jwtConfig from "@modules/auth/config/jwt.config";

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async validateAccessToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: this.jwtConfiguration.accessToken.secret,
      audience: this.jwtConfiguration.accessToken.audience,
      issuer: this.jwtConfiguration.accessToken.issuer,
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