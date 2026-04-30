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
import { AuthTokenGuardAccess } from '@m/auth/guard/access-token.guard';
import { TtsService } from '@m/ai/services/tts.service';
import { SimulationChatService } from '../services/chat.service';
import { SimulationChatDto, SynthesizeDto } from '../dto/simulation.dto';
import { CreateSimulationDTO } from '../dto/create-simulation.dto';
import { SimulationService } from '../services/simulation.service';
import { RequestUser } from '@modules/common/interfaces/interfaces';

@ApiTags('Simulation')
@UseGuards(AuthTokenGuardAccess)
@Controller()
export class SimulationController {
    constructor(
        private readonly tts: TtsService,
        private readonly simulationService: SimulationService,
        private readonly simulationChat: SimulationChatService,
    ) { }

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
    @ApiResponse({
        status: 400,
        description: 'Erro de validação: Simulação não está em andamento ou já foi encerrada',
        schema: {
            example: {
                message: 'Simulação não está em andamento ou já foi encerrada',
                error: 'Bad Request',
                statusCode: 400,
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Simulação não encontrada',
        schema: {
            example: {
                message: 'An instance of Simulation was not found',
                statusCode: 404,
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Não autenticado',
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
    @ApiResponse({
        status: 400,
        description: 'Erro de validação: Texto inválido ou vazio',
        schema: {
            example: {
                message: 'Texto é obrigatório',
                error: 'Bad Request',
                statusCode: 400,
            },
        },
    })
    @ApiResponse({
        status: 500,
        description: 'Erro ao sintetizar áudio (TTS Service)',
        schema: {
            example: {
                message: 'Erro ao sintetizar áudio',
                statusCode: 500,
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Não autenticado',
    })
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