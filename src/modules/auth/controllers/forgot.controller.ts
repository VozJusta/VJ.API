import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDTO } from '@m/auth/dto/forgot-password.dto';
import { ForgotPasswordService } from '@m/auth/service/forgotPassword.service';
import { VerifyForgotCodeDTO } from '@m/auth/dto/verify-forgot-code.dto';
import { VerifyForgotCodeService } from '@m/auth/service/verifyForgotCode.service';
@ApiTags('Auth')
@Controller('forgot')
export class ForgotController {
  constructor(
    private forgotPasswordService: ForgotPasswordService,
    private verifyForgotCodeService: VerifyForgotCodeService,
  ) {}

  @Post('forgot/password')
  @ApiBody({
    description: 'Rota para redefinir senha apos validacao de codigo',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
        new_password: '@Za12345678',
      },
    },
  })
  @ApiResponse({
    description: 'Resposta de sucesso para alteracao de senha',
    status: 200,
    schema: {
      example: {
        message: 'Senha alterada com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Resposta de erro para usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado no sistema',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Resposta de erro para alteração de senha',
    schema: {
      example: {
        statusCode: 401,
        message: 'Senha muito fraca',
        error: 'Unauthorized',
      },
    },
  })
  async forgotPassword(@Body() body: ForgotPasswordDTO) {
    return await this.forgotPasswordService.forgotPassword(body);
  }

  @Post('forgot/verify-code')
  @ApiBody({
    description: 'Rota para validar codigo de recuperacao de senha',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
        code: '123456',
      },
    },
  })
  @ApiResponse({
    description: 'Resposta de sucesso da validacao do codigo de recuperacao',
    status: 200,
    schema: {
      example: {
        message: 'Codigo validado com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Código inválido ou espirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Código inválido ou expirado',
        error: 'Unauthorized',
      },
    },
  })
  async verifyForgotCode(@Body() body: VerifyForgotCodeDTO) {
    return await this.verifyForgotCodeService.verifyForgotCode(body);
  }
}
