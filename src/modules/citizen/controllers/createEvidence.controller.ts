import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEvidenceService } from '../service/createEvidence.service';

@Controller('me')
@ApiTags('Citizen')
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  description: 'Token JWT recebido no login no formato "Bearer <token>"',
  required: true,
})
@UseInterceptors(FileInterceptor('file'))
export class CreateEvidenceController {
  constructor(
    private readonly createEvidenceService: CreateEvidenceService
  ) { }
  @Post('evidence')
  @UseGuards(AuthTokenGuardAccess)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Cria uma evidência para o cidadão autenticado',
    description:
      'Recebe um arquivo (jpg, jpeg, png ou pdf) e cria uma evidência vinculada ao usuário autenticado.',
  })
  @ApiBody({
    description: 'Arquivo da evidência com até 10MB',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de evidência (jpg, jpeg, png ou pdf)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Evidência criada com sucesso.',
    schema: {
      example: {
        id: 'cm123evidence',
        url: 'https://storage.exemplo.com/evidences/evidence_123.pdf',
        public_id: 'evidence_123',
        citizen_id: 'cm123citizen',
        created_at: '2026-05-13T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido, ausente ou fora das regras de validação.',
    schema: {
      example: {
        statusCode: 400,
        message: 'O arquivo deve ter no máximo 10MB',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token inválido',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao criar a evidência.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Erro interno do servidor',
        error: 'Internal Server Error',
      },
    },
  })
  async createEvidence(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({
          maxSize: 10 * 1024 * 1024,
          message: 'O arquivo deve ter no máximo 10MB',
        }),
        new FileTypeValidator({
          fileType: /(jpg|jpeg|png|pdf)$/,
        }),
      ],
    }),
  )
  file: Express.Multer.File, @Req() req: RequestUser) {
    return await this.createEvidenceService.createEvidence(
      file,
      req.user.sub,
      req.user.role,
    )
  }
}
