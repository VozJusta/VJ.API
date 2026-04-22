import { Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { RequestUser } from '../interfaces/interfaces';



@ApiTags('Auth')
@Controller()
export class LogoutController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('/logout')
  @HttpCode(200)
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Access token no formato Bearer <token>.',
    schema: {
      type: 'string',
      example:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0Iiwi...',
    },
  })
  @ApiOperation({
    summary: 'Finaliza a sessão do usuário autenticado',
    description:
      'Esta rota revoga a sessão atual no banco. Depois do logout, o access token e o refresh token dessa sessão deixam de ser aceitos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso.',
    schema: {
      example: {
        message: 'Logout realizado com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou sessão expirada.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token inválido ou sessão expirada',
        error: 'Unauthorized',
      },
    },
  })
  async logout(@Req() req: RequestUser) {
    const sessionId = randomUUID();

    if (req.user.role === 'Citizen') {
      await this.prisma.citizen.update({
        where: { id: req.user.sub },
        data: { session_id: sessionId },
      });
    } else {
      await this.prisma.lawyer.update({
        where: { id: req.user.sub },
        data: { session_id: sessionId },
      });
    }

    return {
      message: 'Logout realizado com sucesso',
    };
  }
}
