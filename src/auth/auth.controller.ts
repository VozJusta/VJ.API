import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTO } from './dto/signIn.dto';
import { SendCodeEmailDTO } from './dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from './dto/validateCode-email.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/user')
    async authenticateUser(@Body() body: SignInDTO) {
        return await this.authService.authenticateUser(body)
    }

    @Post('/lawyer')
    async authenticateLawyer(@Body() body: SignInDTO) {
        return await this.authService.authenticateLawyer(body)
    }

    @Post('send/email')
    async sendEmailCode(@Body() body: SendCodeEmailDTO) {
        return await this.authService.sendEmail(body)
    }

    @Post('validate/email')
    async validateEmailCode(@Body() body: ValidateCodeEmailDTO) {
        return await this.authService.validateEmailCode(body)
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleLogin() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req) {
        return this.authService.authenticateGoogle(
            req.user.email,
            `${req.user.firstName} ${req.user.lastName}`
        )
    }
}
