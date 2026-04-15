import {
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticateGoogleCitizenService } from '@m/auth/service/authGoogleCitizen.service';
import { AuthenticateGoogleLawyerService } from '@m/auth/service/authGoogleLawyer.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GoogleAuthGuard } from '@m/auth/guard/googleAuth.guard';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';
@ApiTags('Auth')
@Controller('google')
export class GoogleController {
  constructor(
    private readonly authenticateGoogleCitizenService: AuthenticateGoogleCitizenService,
    private readonly authenticateGoogleLawyerService: AuthenticateGoogleLawyerService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Inicia autenticação OAuth com Google' })
  @ApiQuery({
    name: 'state',
    required: true,
    description: 'Perfil de cadastro desejado no fluxo OAuth',
    example: 'citizen',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para consentimento do Google',
  })
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(SecurityTokenInterceptor)
  @ApiResponse({
    description: 'Retorno de sucesso da autenticação com o Google',
    schema: {
      example: {
        validated: true,
        sub: '47ff0575-8976-4316-877d-936a2b1d478c',
        role: 'User ou Lawyer',
        email: 'xs.salles@gmail.com',
        full_name: 'Pedro Sales',
        loggedWithGoogle: true,
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
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(SecurityTokenInterceptor)
  @ApiOperation({
    summary: 'Callback da autenticação Google e retorno do perfil autenticado',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    description: 'Perfil enviado no início do OAuth: citizen ou lawyer',
    example: 'lawyer',
  })
  @ApiResponse({
    description: 'Retorno de sucesso da autenticação com o Google',
    status: 200,
    schema: {
      example: {
        validated: true,
        sub: '47ff0575-8976-4316-877d-936a2b1d478c',
        role: 'User ou Lawyer',
        email: 'xs.salles@gmail.com',
        full_name: 'Pedro Sales',
        loggedWithGoogle: true,
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
    status: 409,
    description: 'Email já está cadastrado em outro tipo de conta',
    schema: {
      example: {
        statusCode: 409,
        message: 'Usuário já cadastrado',
        error: 'Conflict',
      },
    },
  })
  async googleUserCallback(@Req() req) {
    const role = req.query.state;

    if (role === 'lawyer') {
      return this.authenticateGoogleLawyerService.authenticateGoogleLawyer(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
      );
    } else if (role === 'citizen') {
      return this.authenticateGoogleCitizenService.authenticateGoogleCitizen(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
      );
    }

    return this.authenticateGoogleCitizenService.authenticateGoogleCitizen(
      req.user.email,
      `${req.user.firstName} ${req.user.lastName}`,
    );
  }
}
