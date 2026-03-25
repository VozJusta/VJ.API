import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/modules/auth/config/jwt.config';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';

type DashboardTokenPayload = {
  sub?: string;
  role?: string;
  email?: string;
  fullName?: string;
  full_name?: string;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async getProfileByAccessToken(rawToken?: string | string[]) {
    const token = this.normalizeToken(rawToken);

    if (!token) {
      throw new UnauthorizedException('Access token não enviado');
    }

    let payload: DashboardTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<DashboardTokenPayload>(
        token,
        this.jwtConfiguration.accessToken,
      );
    } catch {
      throw new UnauthorizedException('Access token inválido');
    }

    if (!payload?.sub) {
      throw new UnauthorizedException('Token sem identificação de usuário');
    }

    const role = payload.role?.toLowerCase();

    if (role === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          cpf: true,
          bio: true,
          avatar_image: true,
          specialization: true,
          lawyer_status: true,
          created_at: true,
        },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      return {
        role: 'Lawyer',
        user: lawyer,
      };
    }

    const citizen = await this.prisma.citizen.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        cpf: true,
        cnpj: true,
        created_at: true,
      },
    });

    if (!citizen) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      role: 'Citizen',
      user: citizen,
    };
  }

  private normalizeToken(rawToken?: string | string[]) {
    if (!rawToken) {
      return;
    }

    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

    if (!token || typeof token !== 'string') {
      return;
    }

    const trimmedToken = token.trim();

    if (trimmedToken.toLowerCase().startsWith('bearer ')) {
      return trimmedToken.split(' ')[1];
    }

    return trimmedToken;
  }
}
