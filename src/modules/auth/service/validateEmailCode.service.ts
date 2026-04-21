import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { ValidateCodeEmailDTO } from '@m/auth/dto/validateCode-email.dto';

interface SecurityTokenPayload {
  sub: string;
  email: string;
  fullName: string;
  role: 'Citizen' | 'Lawyer';
  loggedWithGoogle: boolean;
  sessionId: string;
}

@Injectable()
export class ValidateEmailCodeService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateEmailCode(body: ValidateCodeEmailDTO, token: string) {
    try {
      const payload = await this.jwtService.verify<SecurityTokenPayload>(token);

      const { sub, email, fullName, role, loggedWithGoogle, sessionId } =
        payload;

      const code = await this.prisma.validationCode.findFirst({
        where: {
          email: body.email,
          code: body.code,
          validated: false,
          expired: false,
        },
      });

      if (!code) {
        throw new UnauthorizedException('Código inválido');
      }

      const user =
        role === 'Citizen'
          ? await this.prisma.citizen.findUnique({
              where: { id: sub },
              select: { session_id: true },
            })
          : await this.prisma.lawyer.findUnique({
              where: { id: sub },
              select: { session_id: true },
            });

      if (!user || user.session_id !== sessionId) {
        throw new UnauthorizedException(
          'Sessão expirada, faça login novamente',
        );
      }

      const createdAt = new Date(code.created_at);
      const now = new Date();

      const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      if (diffInMinutes > 15) {
        await this.prisma.validationCode.update({
          where: { id: code?.id },
          data: { expired: true },
        });

        throw new UnauthorizedException('Código expirado');
      }

      const newPayload = {
        sub,
        email,
        fullName,
        role,
        loggedWithGoogle,
        sessionId,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL as any,
        audience: process.env.JWT_TOKEN_AUDIENCE,
        issuer: process.env.JWT_TOKEN_ISSUER,
      });

      const refreshToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TTL as any,
      });

      await this.prisma.validationCode.update({
        where: { id: code.id },
        data: {
          validated: true,
          expired: false,
        },
      });

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
