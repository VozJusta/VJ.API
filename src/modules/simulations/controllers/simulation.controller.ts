import {
    Controller,
    Post,
    Body,
    Res,
    HttpCode,
    UseGuards,
    Req,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { TtsService } from '@m/ai/services/tts.service';
import { SimulationChatService } from '../services/chat.service';
import { SimulationChatDto, SynthesizeDto } from '../dto/simulation.dto';
import { CreateSimulationDTO } from '../dto/create-simulation.dto';
import { SimulationService } from '../services/simulation.service';
import { RequestUser } from '@modules/common/interfaces/interfaces';

@ApiTags('Simulation')
@UseGuards(AuthTokenGuard)
@Controller()
export class SimulationController {
    constructor(
        private readonly tts: TtsService,
        private readonly simulationService: SimulationService,
        private readonly simulationChat: SimulationChatService,
    ) { }

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
                reportId: {
                    type: 'string',
                    description: 'Identificador opcional do report associado',
                    nullable: true,
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
        return await this.simulationService.create(body, req.user.sub)
    }

    @Post('chat')
    @HttpCode(200)
    @ApiOperation({ summary: 'Envia texto para a IA e recebe a resposta' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                simulationId: { type: 'string' },
                text: { type: 'string', description: 'Texto transcrito do usuário' },
            },
            required: ['simulationId', 'text'],
        },
    })
    @ApiResponse({
        status: 200,
        schema: { example: { text: 'Poderia detalhar melhor os fatos ocorridos?' } },
    })
    async chat(@Body() dto: SimulationChatDto) {
        const text = await this.simulationChat.chat(dto);
        return { text };
    }

    @Post('synthesize')
    @HttpCode(200)
    @ApiOperation({ summary: 'Converte texto em áudio MP3 (TTS)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                text: { type: 'string', description: 'Texto para sintetizar' },
            },
            required: ['text'],
        },
    })
    @ApiResponse({ status: 200, description: 'Áudio MP3 gerado com sucesso.' })
    async synthesize(@Body() dto: SynthesizeDto, @Res() res: Response) {
        const audioBuffer = await this.tts.synthesize(dto.text);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
            'Content-Disposition': 'inline; filename="response.mp3"',
        });

        res.end(audioBuffer);
    }
}