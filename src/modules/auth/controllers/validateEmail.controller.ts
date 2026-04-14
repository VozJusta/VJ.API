import { Post, Body, Headers, Controller } from '@nestjs/common';
import { ApiHeader, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateCodeEmailDTO } from '@m/auth/dto/validateCode-email.dto';
import { ValidateEmailCodeService } from '@m/auth/service/validateEmailCode.service';

 @ApiTags('Auth')
@Controller()
export class ValidateEmailController {
  constructor(private validateEmailCodeService: ValidateEmailCodeService) {}
  @Post('validate/email')
  @ApiHeader({
    name: 'x-security-token',
    description: 'Token para validação e autenticação',
    required: true,
  })
  @ApiBody({
    description: 'Validar o codigo enviado pelo email',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
        code: '123456',
      },
    },
  })
  @ApiResponse({
    description: 'Rota de sucesso e envio dos tokens',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
        refresh_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Acesso não autorizado',
        error: 'Unauthorized',
      },
    },
  })
  async validateEmailCode(
    @Body() body: ValidateCodeEmailDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.validateEmailCodeService.validateEmailCode(body, token);
  }
}
