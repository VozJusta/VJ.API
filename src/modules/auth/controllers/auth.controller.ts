import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SignInDTO } from '../dto/signIn.dto';
import { SendCodeEmailDTO } from '../dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from '../dto/validateCode-email.dto';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { VerifyForgotCodeDTO } from '../dto/verify-forgot-code.dto';
import { GoogleAuthGuard } from '../guard/googleAuth.guard';
import { SecurityTokenInterceptor } from '../interceptors/security-token.interceptor';
import { AuthTokenGuard } from '../guard/access-token.guard';
import { ApiBody, ApiHeader, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CompleteCitizenRegisterDTO } from '../dto/complete-citizen-register.dto';
import { Request } from 'express';
import { CompleteLawyerRegisterDTO } from '../dto/complete-lawyer-register.dto';
import { ChangePasswordDTO } from '../dto/change-password.dto';

interface RequestUser extends Request {
  user: {
    sub: string,
    role: string
  }
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  

 
  @Patch('change-password')
  @UseGuards(AuthTokenGuard)
  async changePassword(@Body() body: ChangePasswordDTO, @Req() req: RequestUser) {
    return await this.authService.changePassword(body, req.user.sub)
  }

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
    return await this.authService.forgotPassword(body);
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
    return await this.authService.verifyForgotCode(body);
  }
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiParam({
    name: 'state',
    required: true,
    example: {
      state: 'citizen || lawyer',
    },
  })
  async googleLogin() { }

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
      return this.authService.authenticateGoogleLawyer(
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
