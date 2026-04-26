import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthResult } from '@modules/common/types/auth.types';

@Injectable()
export class AuthenticateGoogleLawyerService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async authenticateGoogleLawyer(
    email: string,
    name: string,
    origin: 'web' | 'mobile',
  ): Promise<AuthResult> {
    const sessionId = randomUUID();
    let lawyer = await this.prisma.lawyer.findFirst({ where: { email } });
    const isNew = !lawyer;

    if (!lawyer) {
      lawyer = await this.prisma.lawyer.create({
        data: { email, full_name: name, session_id: sessionId },
      });
    } else {
      await this.prisma.lawyer.update({
        where: { id: lawyer.id },
        data: { session_id: sessionId },
      });
    }

    const payload = {
      sub: lawyer.id,
      role: 'Lawyer',
      email: lawyer.email,
      fullName: lawyer.full_name,
      sessionId,
      loggedWithGoogle: true,
      registerCompleted: !isNew,
    };

    const token = this.jwtService.sign(
      { type: 'security', ...payload },
      { expiresIn: '20m' },
    );

    if (origin === 'mobile') {
      return {
        type: 'redirect',
        url: this.buildDeepLink(token, payload.registerCompleted),
      };
    }

    return {
      type: 'json',
      token,
      data: {
        validated: true,
        sub: lawyer.id,
        role: 'Lawyer',
        email: lawyer.email,
        full_name: lawyer.full_name,
        loggedWithGoogle: true,
        registerCompleted: !isNew,
        sessionId,
      },
    };
  }

  private buildDeepLink(token: string, registerCompleted: boolean): string {
    const params = new URLSearchParams({
      'x-security-token': token,
      registerCompleted: String(registerCompleted),
    });

    return `seuapp://auth?${params.toString()}`;
  }
}