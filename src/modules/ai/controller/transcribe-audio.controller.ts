import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { TranscribeAudioService } from "../services/transcribe-audio.service";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { TranscribeAudioDTO } from "../dto/transcribe-audio.dto";
import { AuthTokenGuard } from "@modules/auth/guard/access-token.guard";

@Controller('transcribe')
@ApiTags('Report')
@ApiBearerAuth()
@ApiHeader({
    name: 'Authorization',
    description: 'Token de acesso no formato: Bearer <token>',
    required: true
})
@UseGuards(AuthTokenGuard)
export class TranscribeAudioController {
    constructor(private readonly transcribeAudioService: TranscribeAudioService) { }

    @Post()
    @ApiOperation({ summary: 'Transcreve um arquivo de áudio para texto' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo de áudio (máximo de 25MB)'
                }
            },
            required: ['file']
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Áudio transcrito com sucesso.',
        schema: {
            example: {
                transcription: 'Texto transcrito do áudio enviado.'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Arquivo inválido, ausente ou não é áudio.' })
    @ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
    @ApiResponse({ status: 500, description: 'Erro interno ao transcrever o áudio.' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.includes('audio')) {
                    return cb(new BadRequestException('Apenas arquivos de áudio são permitidos'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 25 * 1024 * 1024 },
        }),
    )
    async transcribeAudio(@UploadedFile() file: TranscribeAudioDTO) {
        const transcription = await this.transcribeAudioService.transcribeAudio(file);
        return { transcription };
    }
}