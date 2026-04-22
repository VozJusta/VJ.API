import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@m/prisma/service/prisma.service';
import jwtConfig from '@m/auth/config/jwt.config'
import { TokensPayload } from '@m/common/interfaces/interfaces';


@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<TokensPayload>(refreshToken, {
        secret: this.jwtConfiguration.refreshToken.secret,
      });
      const { role, sub, sessionId } = payload;

      let user;

      if (role === 'Citizen') {
        user = await this.prisma.citizen.findUnique({
          where: { id: sub },
          select: { id: true, email: true, full_name: true, session_id: true },
        });
      } else {
        user = await this.prisma.lawyer.findUnique({
          where: { id: sub },
          select: { id: true, email: true, full_name: true, session_id: true },
        });
      }

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (user.session_id !== sessionId) {
        throw new UnauthorizedException(
          'Sessão expirada, faça login novamente',
        );
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: role,
        fullName: user.full_name,
        sessionId: user.session_id,
        loggedWithGoogle: payload.loggedWithGoogle,
        registerCompleted: payload.registerCompleted,
      };

      return {
        access_token: this.jwtService.sign(newPayload, {
          expiresIn: this.jwtConfiguration.accessToken.ttl,
          secret: this.jwtConfiguration.accessToken.secret,
        }),
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token está inválido ou expirado',
      );
    }
  }
}
