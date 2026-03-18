import { Body, Controller, Get, Headers, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SignInDTO } from '../dto/signIn.dto';
import { SendCodeEmailDTO } from '../dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from '../dto/validateCode-email.dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from '../guard/googleAuth.guard';
import { SecurityTokenInterceptor } from '../interceptors/security-token.interceptor';
import { AuthTokenGuard } from '../guard/access-token.guard';
import { ApiBody, ApiHeader, ApiParam, ApiResponse } from '@nestjs/swagger';
import { validate } from 'class-validator';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { VerifyForgotCodeDTO } from '../dto/verify-forgot-code.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/citizen')
    @UseInterceptors(SecurityTokenInterceptor)
    @ApiBody({
        description: 'Autenticação do usuário',
        required: true,
        schema: {
            example: {
                email: 'pedro@gmail.com',
                password: '@Za12345678'
            }
        }
    })
    @ApiResponse({
        description: 'Retorno da autenticação do usuário',
        status: 201,
        schema: {
            example: {
                validate: true,
                sub: '47ff0575-8976-4316-877d-936a2b1d478c',
                role: 'Citizen',
                email: 'pedro@gmail.com',
                full_name: 'Pedro Sales',
                loggedWithGoogle: false
            }
        },
        headers: {
            'x-security-token': {
                description: 'x-security-token para autenticação',
                schema: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    async authenticateUser(@Body() body: SignInDTO) {
        return await this.authService.authenticateCitizen(body)
    }

    @Post('/lawyer')
    @UseInterceptors(SecurityTokenInterceptor)
    @ApiBody({
        description: 'Autenticação do advogado',
        required: true,
        schema: {
            example: {
                email: 'thiago@gmail.com',
                password: '@Za12345678'
            }
        }
    })
    @ApiResponse({
        description: 'Retorno da autenticação do advogado',
        status: 201,
        schema: {
            example: {
                validate: true,
                sub: '47ff0575-8976-4316-877d-936a2b1d478c',
                role: 'Lawyer',
                email: 'thiago@gmail.com',
                full_name: 'Thiago Menezes',
                loggedWithGoogle: false
            }
        },
        headers: {
            'x-security-token': {
                description: 'x-security-token para autenticação',
                schema: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    async authenticateLawyer(@Body() body: SignInDTO) {
        return await this.authService.authenticateLawyer(body)
    }

    @Post('send/email')
    @ApiBody({
        description: 'Rota para enviar email para 2FA',
        required: true,
        schema: {
            example: {
                email: 'xs.salles@gmail.com'
            }
        }
    })
    @ApiResponse({
        description: 'Resposta de sucesso para o envio do email',
        schema: {
            example: {
                "message": "Código enviado para o email ..."
            }
        }
    })
    async sendEmailCode(@Body() body: SendCodeEmailDTO) {
        return await this.authService.sendEmail(body)
    }

    @Post('send/forgot/email')
    @ApiBody({
        description: 'Rota para enviar email com codigo de recuperacao de senha',
        required: true,
        schema: {
            example: {
                email: 'xs.salles@gmail.com'
            }
        }
    })
    @ApiResponse({
        description: 'Resposta de sucesso para o envio do email de recuperacao',
        schema: {
            example: {
                message: 'Codigo de recuperacao enviado para o email ...'
            }
        }
    })
    async sendForgotEmailCode(@Body() body: SendCodeEmailDTO) {
        return await this.authService.sendForgotPasswordEmail(body)
    }

    @Post('validate/email')
    @ApiHeader({
        name: 'x-security-token',
        description: 'Token para validação e autenticação',
        required: true
    })
    @ApiBody({
        description: 'Validar o codigo enviado pelo email',
        required: true,
        schema: {
            example: {
                email: 'xs.salles@gmail.com',
                code: '123456'
            }
        }
    })
    @ApiResponse({
        description: 'Rota de sucesso e envio dos tokens',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
                refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30'
            }
        }
    })
    async validateEmailCode(@Body() body: ValidateCodeEmailDTO, @Headers('x-security-token') token: string) {
        return await this.authService.validateEmailCode(body, token)
    }

    @Post('forgot/password')
    @ApiBody({
        description: 'Rota para redefinir senha apos validacao de codigo',
        required: true,
        schema: {
            example: {
                email: 'xs.salles@gmail.com',
                new_password: '@Za12345678'
            }
        }
    })
    @ApiResponse({
        description: 'Resposta de sucesso para alteracao de senha',
        schema: {
            example: {
                message: 'Senha alterada com sucesso'
            }
        }
    })
    async forgotPassword(@Body() body: ForgotPasswordDTO) {
        return await this.authService.forgotPassword(body)
    }

    @Post('forgot/verify-code')
    @ApiBody({
        description: 'Rota para validar codigo de recuperacao de senha',
        required: true,
        schema: {
            example: {
                email: 'xs.salles@gmail.com',
                code: '123456'
            }
        }
    })
    @ApiResponse({
        description: 'Resposta de sucesso da validacao do codigo de recuperacao',
        schema: {
            example: {
                message: 'Codigo validado com sucesso'
            }
        }
    })
    async verifyForgotCode(@Body() body: VerifyForgotCodeDTO) {
        return await this.authService.verifyForgotCode(body)
    }
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    @ApiParam({
        name: 'state',
        required: true,
        example: {
            state: 'citizen || lawyer',
        }
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
                loggedWithGoogle: true
            }
        },
        headers: {
            'x-security-token': {
                description: 'x-security-token para autenticação',
                schema: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    async googleUserCallback(@Req() req) {
        const role = req.query.state

        if (role === 'lawyer') {
            return this.authService.authenticateGoogleLawyer(
                req.user.email,
                `${req.user.firstName} ${req.user.lastName}`
            )
        } else if(role === 'citizen') {
            return this.authService.authenticateGoogleCitizen(
            req.user.email,
            `${req.user.firstName} ${req.user.lastName}`
        )
        }

        return this.authService.authenticateGoogleCitizen(
            req.user.email,
            `${req.user.firstName} ${req.user.lastName}`
        )
    }
}
