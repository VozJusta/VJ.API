import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface tokenTypes {
  sub: string;
  role: 'Citizen' | 'Lawyer';
  email: string;
  fullName: string;
  sessionId: string;
}

@ApiTags('Auth')
@Controller()
export class userDataController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Get('/me')
  @HttpCode(200)
  @ApiHeader({
    name: 'token',
    required: true,
    description: 'JWT de acesso enviado no header token.',
    schema: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0Iiwi...',
    },
  })
  @ApiOperation({
    summary: 'Retorna os dados do usuário autenticado',
    description:
      'Lê o token enviado no header token, valida a sessão atual e retorna os dados básicos do usuário logado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido, ausente ou sessão expirada.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Token inválido',
        error: 'Bad Request',
      },
    },
  })
  async getUserData(@Headers('token') token: string) {

    try {
    
      const payload = this.jwtService.verify<tokenTypes>(token);
      const { sub, role, sessionId } = payload;
      if (role === 'Citizen') {
        const user = await this.prisma.citizen.findUnique({
          where: { id: sub },
          select: {
            id: true,
            full_name: true,
            session_id: true,
            subscription: {
              where: {
                user_id: sub,
              },
              select: {
                plan: {
                  select: {
                    type: true,
                  },
                },
              },
            },
          },
        });

        if (!user || user.session_id !== sessionId) {
          throw new BadRequestException('Token inválido');
        }

        return user;
      } else {
        const user = await this.prisma.lawyer.findUnique({
          where: { id: sub },
          select: {
            id: true,
            full_name: true,
            avatar_image: true,
            session_id: true,
            subscription: {
              where: {
                lawyer_id: sub,
              },
              select: {
                plan: {
                  select: {
                    type: true,
                  },
                },
              },
            },
          },
        });

        if (!user || user.session_id !== sessionId) {
          throw new BadRequestException('Token inválido');
        }

        return user;
      }
    } catch (err) {
      throw new BadRequestException('Token inválido');
    }
  }
}
