import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SendForgotPasswordEmailService } from '@m/auth/service/sendForgotPassword.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendCodeEmailDTO } from '@m/auth/dto/sendCode-email.dto';

 @ApiTags('Auth')
@Controller()
export class SendForgotEmailController {
  constructor(
    private sendForgotPasswordEmailService: SendForgotPasswordEmailService,
    private readonly authService: SendForgotPasswordEmailService,
  ) {}
@Post('send/forgot/email')
  @HttpCode(200)
  @ApiBody({
    description: 'Rota para enviar email com codigo de recuperacao de senha',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
      },
    },
  })
  @ApiResponse({
    description:
      'Resposta para a solicitação de recuperação de senha. Para evitar enumeração de usuários, a API pode retornar sucesso mesmo quando o email não estiver cadastrado.',
    status: 200,
    schema: {
      example: {
        message:
          'Se o email estiver cadastrado, o código de recuperação será enviado.',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Código já foi enviado há menos de 15 minutos',
    schema: {
      example: {
        statusCode: 409,
        message: 'Código já enviado',
        error: 'Conflict',
      },
    },
  })
  async sendForgotEmailCode(@Body() body: SendCodeEmailDTO) {
    return await this.authService.sendForgotPasswordEmail(body);
  }
}
