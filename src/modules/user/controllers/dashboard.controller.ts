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
    name: 'access-token',
    required: true,
    description: 'Access token recebido no login',
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
    return await this.dashboardService.getProfileByUserId(userId, role);
  }
}
