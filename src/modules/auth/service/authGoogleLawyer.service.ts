import { ConflictException, Inject, Injectable } from '@nestjs/common';
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
  ) { }

  async authenticateGoogleLawyer(
    email: string,
    name: string,
    origin: 'web' | 'mobile',
  ): Promise<AuthResult> {
    let lawyer = await this.prisma.lawyer.findFirst({ where: { email } });
    const isNew = !lawyer;

    if (!lawyer) {
      const citizen = await this.prisma.citizen.findFirst({
        where: { email: email },
      });

      if (citizen) {
        if (origin === 'mobile') {
          return {
            type: 'redirect',
            url: this.buildDeepLinkError('account_conflict'),
          };
        }
        throw new ConflictException("Usuário já cadastrado");
      }


      const sessionId = randomUUID();
      lawyer = await this.prisma.lawyer.create({
        data: {
          email,
          full_name: name,
          session_id: sessionId,
          subscription: {
            create: {
              plan: {
                connect: { id: 'plan_adv_junior' },
              },
              subscription_status: 'active',
              current_period_end: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
              ),
            },
          },
        },
      });
    }

    const sessionId = lawyer.session_id;

    const payload = {
      validated: true,
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
      type: 'redirect',
      url: this.buildWebRedirect(token, {
        validated: true,
        sub: lawyer.id,
        role: 'Lawyer',
        email: lawyer.email,
        full_name: lawyer.full_name,
        loggedWithGoogle: true,
        registerCompleted: !isNew,
        sessionId,
      }),
    };
  }

  private buildDeepLink(token: string, registerCompleted: boolean): string {
    const params = new URLSearchParams({
      'x-security-token': token,
      registerCompleted: String(registerCompleted),
    });

    return `${process.env.DEEPLINK_URL}://auth?${params.toString()}`;
  }

  private buildWebRedirect(token: string, data: Record<string, unknown>): string {
    const encoded = Buffer.from(JSON.stringify({ ...data, securityToken: token })).toString('base64');
    return `${process.env.FRONTEND_URL}/auth/callback?authData=${encoded}`;
  }

  private buildDeepLinkError(error: string): string {
    const params = new URLSearchParams({ error });
    return `${process.env.DEEPLINK_URL}://auth?${params.toString()}`;
  }
}

