import { Post, Body, Controller } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendCodeEmailDTO } from '@m/auth/dto/sendCode-email.dto';
import { SendEmailService } from '@m/auth/service/sendEmail.service';
@ApiTags('Auth')
@Controller()
export class SendEmailController {
  constructor(
    private sendEmailService: SendEmailService,
    private readonly authService: SendEmailService,
  ) {}

  @Post('send/email')
  @ApiBody({
    description: 'Rota para enviar email para 2FA',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
      },
    },
  })
  @ApiResponse({
    description: 'Resposta de sucesso para o envio do email',
    status: 200,
    schema: {
      example: {
        message: 'Código enviado para o email ...',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Verifica se o código já foi utilizado ou se o email é valido',
    schema: {
      example: {
        statusCode: 409,
        message: 'Código já utilizado ou expirado',
        error: 'Conflict',
      },
    },
  })
  async sendEmailCode(@Body() body: SendCodeEmailDTO) {
    return await this.authService.sendEmail(body);
  }
}
