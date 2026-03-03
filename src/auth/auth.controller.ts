import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTO } from './dto/signIn.dto';
import { SendCodeEmailDTO } from './dto/sendCode-email.dto';

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
}
