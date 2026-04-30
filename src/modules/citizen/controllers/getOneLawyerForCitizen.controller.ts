import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FindLawyerForCitizen } from '../service/findLawyerForCitizen.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
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
export class GetOneLawyerForCitizen {
  constructor(private readonly findLawyer: FindLawyerForCitizen) {}

  @Get('/:lawyerId')
  @UseGuards(AuthTokenGuardAccess)
  @ApiOperation({
    summary: 'Retorna os dados de um advogado por id',
    description:
      'Retorna os dados públicos de um advogado para o cidadão autenticado.',
  })
  @ApiParam({
    name: 'lawyerId',
    required: true,
    type: 'string',
    description: 'ID do advogado',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do advogado retornados com sucesso.',
    schema: {
      example: {
        id: 'f1f6f8d2-7d80-46d1-9c80-32a9d8c5b6de',
        full_name: 'Ana Souza',
        specialization: 'Labor_and_employment',
        avatar_image: 'https://cdn.example.com/avatars/ana.png',
        oab_number: '123456',
        oab_state: 'SP',
        bio: 'Advogada trabalhista com 10 anos de atuação.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Role inválida.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cidadão ou advogado não encontrado.',
  })
  async getOneLawyer(
    @Req() req: RequestUser,
    @Param('lawyerId') lawyerId: string,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.findLawyer.findLawyerForCitizen(userId, role, lawyerId);
  }
}
