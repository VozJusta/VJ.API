import {
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@m/prisma/service/prisma.service';
import jwtConfig from '@m/auth/config/jwt.config';

interface tokenTypes {
  sub: string;
  role: 'citizen' | 'lawyer';
  email: string;
  fullName: string;
  loggedWithGoogle: boolean;
  registerCompleted: boolean;
}

export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<tokenTypes>(refreshToken);
      const { role, sub } = payload;

      let user;

      if (role === 'citizen') {
        user = await this.prisma.citizen.findUnique({ where: { id: sub } });
      } else {
        user = await this.prisma.lawyer.findUnique({ where: { id: sub } });
      }

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const newPayload = {
        id: user.id,
        email: user.email,
        role: role,
        fullName: user.fullName,
        loggedWithGoogle: user.loggedWithGoogle,
        registerCompleted: user.registerCompleted,
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
