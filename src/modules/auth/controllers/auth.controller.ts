import { Body, Controller, Get, Headers, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SignInDTO } from '../dto/signIn.dto';
import { SendCodeEmailDTO } from '../dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from '../dto/validateCode-email.dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from '../guard/googleAuth.guard';
import { SecurityTokenInterceptor } from '../interceptors/security-token.interceptor';
import { AuthTokenGuard } from '../guard/access-token.guard';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { validate } from 'class-validator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/user')
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
                role: 'User',
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
        return await this.authService.authenticateUser(body)
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
    async sendEmailCode(@Body() body: SendCodeEmailDTO) {
        return await this.authService.sendEmail(body)
    }

    @Post('validate/email')
    async validateEmailCode(@Body() body: ValidateCodeEmailDTO, @Headers('x-security-token') token: string) {
        return await this.authService.validateEmailCode(body, token)
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() { }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    @UseInterceptors(SecurityTokenInterceptor)
    async googleUserCallback(@Req() req) {
        const role = req.query.state

        if (role === 'lawyer') {
            return this.authService.authenticateGoogleLawyer(
                req.user.email,
                `${req.user.firstName} ${req.user.lastName}`
            )
        }

        return this.authService.authenticateGoogleUser(
            req.user.email,
            `${req.user.firstName} ${req.user.lastName}`
        )
    }
}
