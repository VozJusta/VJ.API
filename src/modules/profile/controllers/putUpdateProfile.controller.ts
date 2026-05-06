import { Body, Controller, ForbiddenException, Put, Req, UseGuards } from '@nestjs/common';
import { UpdateCitizenProfileService } from '@m/profile/service/updateCitizenProfile.service';
import { UpdateLawyerProfileService } from '@m/profile/service/updateLawyerProfile.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { UpdateCitizenDTO } from '@m/profile/dto/update-citizen.dto';
import { UpdateLawyerDTO } from '@m/profile/dto/update-lawyer.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth()
@ApiExtraModels(UpdateCitizenDTO, UpdateLawyerDTO)
@Controller('profile')
export class PutUpdateProfile {
  constructor(
    private readonly updateCitizen: UpdateCitizenProfileService,
    private readonly updateLawyer: UpdateLawyerProfileService,
  ) {}

  @Put()
  @UseGuards(AuthTokenGuardAccess)
  @ApiOperation({
    summary: 'Atualiza o perfil autenticado',
    description:
      'Atualiza os dados do perfil de acordo com a role do usuário autenticado. Cidadão e advogado possuem campos diferentes.',
  })
  @ApiBody({
    required: true,
    description: 'Dados para atualização do perfil',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(UpdateCitizenDTO),
        },
        {
          $ref: getSchemaPath(UpdateLawyerDTO),
        },
      ],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso.',
    schema: {
      oneOf: [
        {
          example: {
            id: '47ff0575-8976-4316-877d-936a2b1d478c',
            full_name: 'Pedro Sales',
            email: 'pedro@gmail.com',
            phone: '11 99999-9999',
            cpf: '123.456.789-00',
          },
        },
        {
          example: {
            id: '9fbe6cc4-1f90-4df3-8dd2-6eb36747c512',
            full_name: 'Thiago Menezes',
            bio: 'Advogado focado em direito tributário e empresarial.',
            email: 'thiago@gmail.com',
            phone: '11 99999-9999',
            cnpj: '12.345.678/0001-90',
            specialization: 'Tax',
            lawyer_status: 'Ativo',
            oab_number: '123456/SP',
            oab_state: 'SP',
          },
        },
      ],
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
    description: 'Role não autorizada para atualizar o perfil.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Role inválida',
        error: 'Forbidden',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Perfil não encontrado para o usuário autenticado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Cidadão não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro inesperado ao atualizar o perfil.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Erro interno do servidor',
        error: 'Internal Server Error',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos: formato incorreto, CPF/CNPJ duplicado, conflito de documento ou violação de regras do perfil.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Perfil inválido: CPF e CNPJ cadastrados ao mesmo tempo',
        error: 'Bad Request',
      },
    },
  })
  async putUpdateProfile(@Req() req: RequestUser, @Body() body: UpdateCitizenDTO | UpdateLawyerDTO) {
    const userId = req.user.sub;
    const role = req.user.role?.toLowerCase?.() ?? '';

    if (role === 'citizen') {
      return this.updateCitizen.updateCitizen(userId, role, body);
    }

    if (role === 'lawyer') {
      return this.updateLawyer.updateLawyer(userId, role, body);
    }

    throw new ForbiddenException('Role não autorizada para atualizar o perfil');
  }
}
