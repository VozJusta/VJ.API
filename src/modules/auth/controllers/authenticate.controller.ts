import { Controller, Body, UseInterceptors, Post } from '@nestjs/common';
import { SignInDTO } from '@m/auth/dto/signIn.dto';
import { AuthenticateService } from '@m/auth/service/authenticate.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';

@ApiTags('Auth')
@Controller()
export class AuthenticateController {
  constructor(private readonly authService: AuthenticateService) {}
  @Post('/authenticate')
  @UseInterceptors(SecurityTokenInterceptor)
  @ApiBody({
    description: 'Autenticação do usuário',
    required: true,
    schema: {
      example: {
        email: 'pedro@gmail.com',
        password: '@Za12345678',
      },
    },
  })
  @ApiResponse({
    description: 'Retorno da autenticação',
    status: 201,
    schema: {
      example: {
        validate: true,
        sub: '47ff0575-8976-4316-877d-936a2b1d478c',
        role: 'Citizen | Lawyer',
        email: 'pedro@gmail.com',
        full_name: 'Pedro Sales',
        loggedWithGoogle: false,
      },
    },
    headers: {
      'x-security-token': {
        description: 'x-security-token para autenticação',
        schema: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
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
  async authenticate(@Body() body: SignInDTO) {
    return await this.authService.authenticate(body);
  }
}
