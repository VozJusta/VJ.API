import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SendForgotPasswordEmailService } from '@m/auth/service/sendForgotPassword.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendCodeEmailDTO } from '@m/auth/dto/sendCode-email.dto';

 @ApiTags('Auth')
@Controller()
export class SendForgotEmailController {
  constructor(
    private sendForgotPasswordEmailService: SendForgotPasswordEmailService,
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
    description: 'Resposta de sucesso para o envio do email de recuperacao',
    status: 200,
    schema: {
      example: {
        message: 'Codigo de recuperacao enviado para o email ...',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Email não encontrado no sistema',
    schema: {
      example: {
        statusCode: 404,
        message: 'Email não cadastrado',
        error: 'Not Found',
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
    return await this.sendForgotPasswordEmailService.sendForgotPasswordEmail(
      body,
    );
  }
}
