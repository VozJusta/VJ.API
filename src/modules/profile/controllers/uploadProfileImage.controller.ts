import { BadRequestException, Controller, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadImageProfileService } from '@m/profile/service/uploadImageProfile.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class UploadProfileImageController {
  constructor(private readonly uploadService: UploadImageProfileService) {}

  @Patch('avatar')
  @UseGuards(AuthTokenGuardAccess)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Atualiza o avatar do perfil autenticado',
    description:
      'Recebe uma imagem em multipart/form-data, envia para o storage e salva a URL no perfil do usuário autenticado.',
  })
  @ApiBody({
    description: 'Arquivo de imagem para o avatar',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem com até 5MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar atualizado com sucesso.',
    schema: {
      example: {
        url: 'https://res.cloudinary.com/example/image/upload/v123/profile_123.png',
        public_id: 'profile_123',
        user: {
          id: '47ff0575-8976-4316-877d-936a2b1d478c',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido ou expirado.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token inválido',
        error: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Role inválida para atualização de avatar.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Role inválida',
        error: 'Forbidden',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Arquivo não enviado, arquivo que não é imagem ou formato não suportado.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Apenas imagens são permitidas',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado para o perfil autenticado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiPayloadTooLargeResponse({
    description: 'Arquivo maior que o limite permitido de 5MB.',
    schema: {
      example: {
        statusCode: 413,
        message: 'Arquivo maior que o limite permitido',
        error: 'Payload Too Large',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro inesperado ao enviar ou salvar a imagem no storage.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Erro ao fazer upload da imagem',
        error: 'Internal Server Error',
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Apenas imagens são permitidas'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(@Req() req: RequestUser, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub;
    const role = req.user.role?.toLowerCase?.() ?? '';

    const res = await this.uploadService.uploadAvatar(userId, role, file);
    return res;
  }
}
