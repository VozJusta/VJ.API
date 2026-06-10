import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthResult } from '@modules/common/types/auth.types';

@Injectable()
export class AuthenticateGoogleCitizenService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) { }

  async authenticateGoogleCitizen(
    email: string,
    name: string,
    origin: 'web' | 'mobile',
  ): Promise<AuthResult> {
    let citizen = await this.prisma.citizen.findFirst({
      where: {
        email: email,
      },
    });

    const isNew = !citizen;

    if (!citizen) {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { email: email },
      });

      if (lawyer) {
        throw new ConflictException('Usuário já cadastrado');
      }

      const sessionId = randomUUID();
      citizen = await this.prisma.citizen.create({
        data: {
          email: email,
          full_name: name,
          session_id: sessionId,
          stripe_customer_id: null,
          subscription: {
            create: {
              plan: {
                connect: { id: 'plan_free' },
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

    const sessionId = citizen.session_id;

    const payload = {
      validated: true,
      sub: citizen.id,
      role: 'Citizen',
      email: citizen.email,
      full_name: citizen.full_name,
      loggedWithGoogle: true,
      registerCompleted: !isNew,
      sessionId,
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
        sub: citizen.id,
        role: 'Citizen',
        email: citizen.email,
        full_name: citizen.full_name,
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
}
