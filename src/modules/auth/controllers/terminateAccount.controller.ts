import { Body, Controller, Delete, HttpCode, Headers, Req } from '@nestjs/common';
import {
  ApiHeader,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TerminateAccountService } from '@m/auth/service/terminateAccount.service';
import { RequestUser } from '../interfaces/interfaces';

@ApiTags('Auth')
@Controller()
export class TerminateAccountController {
  constructor(private terminateAccountService: TerminateAccountService) { }
  
  @ApiOperation({
    summary: 'Exclui permanentemente a conta do usuário autenticado',
    description:
      'Recebe o token JWT no header Authorization e a senha atual no body para confirmar a exclusão da conta.',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'JWT de acesso do usuário autenticado.',
    schema: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0Iiwi...',
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['password'],
      properties: {
        password: {
          type: 'string',
          example: 'MinhaSenha@123',
          description: 'Senha atual para confirmar a exclusão da conta',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Conta excluída com sucesso',
    schema: {
      example: {
        message: 'Conta excluída permanentemente',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflito na exclusão: token inválido, senha ausente, senha incorreta ou usuário não encontrado',
  })
  @HttpCode(200)
  @Delete('/terminate-account')
  async terminateAccount(
    @Req() req: RequestUser,
    @Body('password') password: string,
  ) {
    return await this.terminateAccountService.terminateAccount(
      req.user.sub,
      password,
    );
  }
}
