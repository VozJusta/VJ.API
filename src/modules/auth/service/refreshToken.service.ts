import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@m/prisma/service/prisma.service';
import jwtConfig from '@m/auth/config/jwt.config';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async refreshToken(
    role: string,
    sub: string,
    sessionId: string,
    loggedWithGoogle?: boolean,
  ) {
    try {
      if (
        !role ||
        !sub ||
        !sessionId ||
        typeof loggedWithGoogle === 'undefined'
      ) {
        throw new UnauthorizedException(
          'Refresh token está inválido ou expirado',
        );
      }

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
        role,
        email: user.email,
        fullName: user.full_name,
        loggedWithGoogle,
        sessionId,
      };
      const accessToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL as any,
        audience: process.env.JWT_TOKEN_AUDIENCE,
        issuer: process.env.JWT_TOKEN_ISSUER,
      });

      return {
        access_token: accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token está inválido ou expirado',
      );
    }
  }
}
