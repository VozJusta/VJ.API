import { Controller, Get, Headers } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../service/dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
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
  async getDashboard(
    @Headers('access-token') accessToken: string,
    @Headers('authorization') authorization: string,
  ) {
    return await this.dashboardService.getProfileByAccessToken(
      accessToken || authorization,
    );
  }
}
