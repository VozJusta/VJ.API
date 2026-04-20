import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { FindCitizenReportByIdService } from '@modules/dashboard/service/citizen/findCitizenReportById.service';
import { Get, UseGuards, Req, Param, Controller } from '@nestjs/common';
import {
    ApiOperation,
    ApiHeader,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        role: string;
    };
}

@ApiTags('Dashboard')
@Controller()
export class GetOneReportsCitizenController {
    constructor(
        private readonly dashboardService: FindCitizenReportByIdService,
    ) { }
    @Get('/citizens/me/reports/:reportId')
    @UseGuards(AuthTokenGuard)
    @ApiOperation({
        summary: 'Retorna um relatório do cidadão autenticado por id',
        description:
            'Busca um único relatório pelo id, garantindo que pertença ao usuário autenticado.',
    })
    @ApiHeader({
        name: 'Authorization',
        required: true,
        description: 'Token JWT recebido no login no formato "Bearer <token>"',
    })
    @ApiParam({
        name: 'reportId',
        required: true,
        description: 'Id do relatório a ser consultado.',
    })
    @ApiResponse({
        status: 200,
        description: 'Retorna um único relatório do cidadão autenticado.',
    })
    @ApiResponse({
        status: 404,
        description: 'Cidadão ou relatório não encontrado.',
    })
    async getCitizenReport(
        @Req() req: AuthenticatedRequest,
        @Param('reportId') reportId: string,
    ) {
        const userId = req.user.sub;
        const role = req.user.role;

        return this.dashboardService.findCitizenReportById(userId, role, reportId);
    }
}
