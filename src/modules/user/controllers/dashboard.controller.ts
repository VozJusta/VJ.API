import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../service/dashboard.service';
import { AuthTokenGuard } from 'src/modules/auth/guard/access-token.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Retorna o dashboard do usuário autenticado',
    description:
      'Busca os dados do perfil conforme a role presente no token JWT. O objeto user varia entre Lawyer e Citizen.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os dados do usuário autenticado e a role correspondente.',
    schema: {
      example: {
        role: 'Lawyer',
        user: {
          id: '47ff0575-8976-4316-877d-936a2b1d478c',
          full_name: 'Pedro Sales',
          email: 'pedro@gmail.com',
          phone: '11 99999-9999',
          cpf: '123.456.789-00',
          bio: 'Advogado especialista em direito tributário',
          avatar_image: 'https://example.com/avatar.png',
          specialization: 'Tax',
          lawyer_status: 'ACTIVE',
          report: [],
          created_at: '2026-04-02T10:00:00.000Z',
        },
        message: 'Informações de usuário retornadas com sucesso'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Role inválida no token autenticado.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Role inválida',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token está ausente, inválido ou expirado',
        error: 'Unauthorized',
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado para a role informada.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Advogado não encontrado',
        error: 'Not Found',
      },
    },
  })
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.dashboardService.getProfileByUserId(userId, role);
  }
}
