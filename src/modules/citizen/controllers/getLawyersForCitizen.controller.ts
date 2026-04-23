import { ListLawyersForCitizens } from '@m/citizen/service/listLawyersForCitizens.service';
import { RequestUser } from '@m/common/interfaces/interfaces';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@Controller('lawyers')
@ApiTags('Citizen')
@ApiBearerAuth()
@ApiHeader({
    name: 'Authorization',
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
    required: true,
})
export class GetLawyersForCitizen {
    constructor(private readonly listLawyers: ListLawyersForCitizens) {}

    @Get()
    @UseGuards(AuthTokenGuard)
    async getLawyers(@Req() req: RequestUser) {
        const userId = req.user.sub;
        const role = req.user.role;

        return this.listLawyers.listLawyers(userId, role);
    }
}