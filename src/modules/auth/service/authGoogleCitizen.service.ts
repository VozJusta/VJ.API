import { Inject, Injectable } from '@nestjs/common';
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

  async authenticateGoogleCitizen(email: string, name: string, origin: 'web' | 'mobile'): Promise<AuthResult> {
    const sessionId = randomUUID();
    let citizen = await this.prisma.citizen.findFirst({
      where: {
        email: email,
      },
    });

    const isNew = !citizen

    if (!citizen) {
      citizen = await this.prisma.citizen.create({
        data: {
          email: email,
          full_name: name,
          session_id: sessionId,
        },
      });
    }
    else {
      await this.prisma.citizen.update({
        where: { id: citizen.id },
        data: { session_id: sessionId },
      });
    }

    const payload = {
      validated: true,
      sub: citizen.id,
      role: 'Citizen',
      email: citizen.email,
      full_name: citizen.full_name,
      loggedWithGoogle: true,
      registerCompleted: !isNew,
      sessionId,
    }

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
        sub: citizen.id,
        role: 'Citizen',
        email: citizen.email,
        full_name: citizen.full_name,
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

