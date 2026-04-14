import {
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticateGoogleCitizenService } from '../service/authGoogleCitizen.service';
import { AuthenticateGoogleLawyerService } from '../service/authGoogleLawyer.service';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from '../guard/googleAuth.guard';
import { SecurityTokenInterceptor } from '../interceptors/security-token.interceptor';

@Controller('google')
export class GoogleController {
  constructor(
    private authService: AuthenticateGoogleCitizenService,
    private authLawyerService: AuthenticateGoogleLawyerService,
  ) {}
  @ApiTags('Auth')
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiParam({
    name: 'state',
    required: true,
    example: {
      state: 'citizen || lawyer',
    },
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
  async googleUserCallback(@Req() req) {
    const role = req.query.state;

    if (role === 'lawyer') {
      return this.authLawyerService.authenticateGoogleLawyer(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
      );
    } else if (role === 'citizen') {
      return this.authService.authenticateGoogleCitizen(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
      );
    }

    return this.authService.authenticateGoogleCitizen(
      req.user.email,
      `${req.user.firstName} ${req.user.lastName}`,
    );
  }
}
