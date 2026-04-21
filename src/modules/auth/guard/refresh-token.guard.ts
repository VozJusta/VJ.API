import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import jwtConfig from '@m/auth/config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { PrismaService } from '@m/prisma/service/prisma.service';

interface RefreshTokenPayload {
  sub: string;
  role: 'Citizen' | 'Lawyer';
  email: string;
  fullName: string;
  sessionId: string;
  loggedWithGoogle?: boolean;
  registerCompleted?: boolean;
}

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não encontrado');
    }

    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        token,
        this.jwtConfiguration.refreshToken,
      );
      const user =
        payload.role === 'Citizen'
          ? await this.prisma.citizen.findUnique({
              where: { id: payload.sub },
              select: { session_id: true },
            })
          : await this.prisma.lawyer.findUnique({
              where: { id: payload.sub },
              select: { session_id: true },
            });

      if (!user || user.session_id !== payload.sessionId) {
        throw new UnauthorizedException(
          'Sessão expirada, faça login novamente',
        );
      }

      (request as Request & { user?: unknown }).user = payload;
    } catch (err) {
      throw new UnauthorizedException('Token inválido ou sessão expirada');
    }

    return true;
  }

  extractTokenHeader(req: Request) {
    const authorization = req.headers?.authorization;

    if (!authorization || typeof authorization !== 'string') {
      return;
    }

    return authorization.split(' ')[1];
  }
}
