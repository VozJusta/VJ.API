import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticateGoogleCitizenService } from '@m/auth/service/authGoogleCitizen.service';
import { AuthenticateGoogleLawyerService } from '@m/auth/service/authGoogleLawyer.service';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GoogleAuthGuard } from '@m/auth/guard/googleAuth.guard';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';
import { Response } from 'express';
import { AuthResult } from '@modules/common/types/auth.types';

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
    description: 'Formato: "<role>|<origin>" — ex: "citizen|mobile" ou "lawyer|web"',
    example: 'citizen|mobile',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para consentimento do Google',
  })
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(SecurityTokenInterceptor)
  @ApiOperation({
    summary: 'Callback da autenticação Google e retorno do perfil autenticado',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    description: 'Formato: "<role>|<origin>" — ex: "citizen|mobile" ou "lawyer|web"',
    example: 'citizen|mobile',
  })
  @ApiResponse({
    status: 302,
    description: 'Mobile: redireciona para seuapp://auth?x-security-token=...&registerCompleted=...',
  })
  @ApiResponse({
    description: 'Web: retorno de sucesso da autenticação com o Google',
    status: 200,
    schema: {
      example: {
        validated: true,
        sub: '47ff0575-8976-4316-877d-936a2b1d478c',
        role: 'Citizen ou Lawyer',
        email: 'xs.salles@gmail.com',
        full_name: 'Pedro Sales',
        loggedWithGoogle: true,
        registerCompleted: true,
      },
    },
    headers: {
      'x-security-token': {
        description: 'JWT de autenticação (apenas no fluxo web)',
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
  async googleUserCallback(@Req() req, @Res() res: Response) {
  const [role, origin] = ((req.query.state as string) ?? 'citizen|web').split('|');
  const typedOrigin = (origin ?? 'web') as 'web' | 'mobile';

  let result: AuthResult;

  if (role === 'lawyer') {
    result = await this.authenticateGoogleLawyerService.authenticateGoogleLawyer(
      req.user.email,
      `${req.user.firstName} ${req.user.lastName}`,
      typedOrigin,
    );
  } else {
    // citizen é o fallback (citizen | undefined | qualquer outro valor)
    result = await this.authenticateGoogleCitizenService.authenticateGoogleCitizen(
      req.user.email,
      `${req.user.firstName} ${req.user.lastName}`,
      typedOrigin,
    );
  }

  if (result.type === 'redirect') {
    return res.redirect(result.url);
  }

  res.setHeader('x-security-token', result.token);
  return res.json(result.data);
}

}