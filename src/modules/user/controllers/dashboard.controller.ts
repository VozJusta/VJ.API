import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os dados do usuário autenticado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido',
  })
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.dashboardService.getProfileByUserId(userId, role);
  }
}
