import { Body, Controller, Get, Headers, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SignInDTO } from '../dto/signIn.dto';
import { SendCodeEmailDTO } from '../dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from '../dto/validateCode-email.dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from '../guard/googleAuth.guard';
import { SecurityTokenInterceptor } from '../interceptors/security-token.interceptor';
import { AuthTokenGuard } from '../guard/access-token.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/user')
    @UseInterceptors(SecurityTokenInterceptor)
    async authenticateUser(@Body() body: SignInDTO) {
        return await this.authService.authenticateUser(body)
    }

    @Post('/lawyer')
    @UseInterceptors(SecurityTokenInterceptor)
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
