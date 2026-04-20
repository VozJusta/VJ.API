import { Body, Controller, Delete, HttpCode, Param } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TerminateAccountService } from '../service/terminateAccount.service';

@ApiTags('Auth')
@Controller()
export class TerminateAccountController {
  constructor(private terminateAccountService: TerminateAccountService) {}

  @ApiOperation({ summary: 'Exclui permanentemente a conta do usuário' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do usuário (citizen ou lawyer)',
    type: String,
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
      'Conflito na exclusão: ID inválido, senha ausente, senha incorreta ou usuário não encontrado',
  })
  @HttpCode(200)
  @Delete('/terminate-account/:id')
  async terminateAccount(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return await this.terminateAccountService.terminateAccount(id, password);
  }
}
