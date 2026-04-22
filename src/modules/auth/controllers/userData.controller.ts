import {
  Controller,
  Get,
  Headers,
  HttpCode,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUserDataService } from '@m/auth/service/getUserData.service';
import { RequestUser } from '../interfaces/interfaces';
import { AuthTokenGuard } from '../guard/access-token.guard';

@ApiTags('Auth')
@Controller()
export class userDataController {
  constructor(private readonly getUserDataService: GetUserDataService) { }

  @Get('/me')
  @HttpCode(200)
  @UseGuards(AuthTokenGuard)
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'JWT de acesso do usuário autenticado.',
    schema: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0Iiwi...',
    },
  })
  @ApiOperation({
    summary: 'Retorna os dados do usuário autenticado',
    description:
      'Lê o token enviado no header token, valida a sessão atual e retorna os dados básicos do usuário logado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso.',
    schema: {
      oneOf: [
        {
          example: {
            id: '47ff0575-8976-4316-877d-936a2b1d478c',
            full_name: 'Pedro Sales',
            session_id: 'ab1cde23-4567-890f-gh12-ijkl345mno67',
            subscription: {
              plan: {
                type: 'FREE',
              },
            },
          },
        },
        {
          example: {
            id: '9fbe6cc4-1f90-4df3-8dd2-6eb36747c512',
            full_name: 'Thiago Menezes',
            avatar_image: 'https://cdn.example.com/avatar/thiago.png',
            session_id: 'fe21dcba-7654-3210-ba98-zyxwvu543210',
            subscription: {
              plan: {
                type: 'PREMIUM',
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido, ausente ou sessão expirada.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Token inválido',
        error: 'Bad Request',
      },
    },
  })
  async getUserData(@Req() req: RequestUser) {

    const userId = req.user.sub;
    const role = req.user.role;

    return await this.getUserDataService.getUserData(userId, role);
  }
}
