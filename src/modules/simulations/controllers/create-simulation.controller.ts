import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { CreateSimulationService } from "../services/create-simulation.service";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateSimulationDTO } from "../dto/create-simulation.dto";
import { RequestUser } from "@modules/common/interfaces/interfaces";
import { AuthTokenGuard } from "@modules/auth/guard/access-token.guard";

@Controller()
@ApiTags('Simulation')
@UseGuards(AuthTokenGuard)
export class CreateSimulationController {
    constructor(private readonly createSimulationService: CreateSimulationService) {}

    @Post()
    @ApiOperation({ summary: 'Cria uma nova simulação de audiência' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                personality: {
                    type: 'string',
                    description: 'Perfil de personalidade da audiência',
                },
            },
            required: ['personality'],
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Simulação criada com sucesso.',
        schema: {
            example: {
                id: 'b4d9d7a8-9bde-4a54-9e2a-7df6c7d8d2d2',
                citizen_id: '47ff0575-8976-4316-877d-936a2b1d478c',
                personality: 'Aggressive',
                report_id: null,
                status: 'Pending',
            },
        },
    })
    async create(@Body() body: CreateSimulationDTO, @Req() req: RequestUser) {
        return await this.createSimulationService.create(body, req.user.sub)
    }

}