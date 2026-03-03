import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import { SignInDTO } from './dto/signIn.dto';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { SmsService } from 'src/sms/sms.service';
import { SendCodeEmailDTO } from './dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from './dto/validateCode-email.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol,
        private readonly sendEmailCode: EmailService,
        private readonly sendSms: SmsService,

        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtService: JwtService
    ) { }

    async authenticateUser(body: SignInDTO) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: body.email
            }
        })

        if (!user) {
            throw new UnauthorizedException('Email/senha incorretos')
        }

        const passwordMatch = await this.hashingService.compare(body.password, user.password)

        if (!passwordMatch) {
            throw new UnauthorizedException('Email/senha incorretos')
        }

        const token = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                name: user.full_name
            },
            {
                secret: this.jwtConfiguration.secret,
                expiresIn: this.jwtConfiguration.jwtTtl as any,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer
            }
        )

        return {
            access_token: token
        }
    }

    async authenticateLawyer(body: SignInDTO) {
        const lawyer = await this.prisma.lawyer.findFirst({
            where: {
                email: body.email
            }
        })

        if (!lawyer) {
            throw new UnauthorizedException('Email/senha inválidos')
        }

        const passwordMatch = await this.hashingService.compare(body.password, lawyer.password)

        if (!passwordMatch) {
            throw new UnauthorizedException('Email/senha inválidos')
        }

        const token = await this.jwtService.signAsync(
            {
                sub: lawyer.id,
                email: lawyer.email,
                name: lawyer.full_name
            },
            {
                secret: this.jwtConfiguration.secret,
                expiresIn: this.jwtConfiguration.jwtTtl as any,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer
            }
        )

        return {
            access_token: token
        }
    }

    async sendEmail(email: SendCodeEmailDTO) {
        const codeUsed = await this.prisma.validationCode.findFirst({
            where: {
                email: email.email,
                validated: false
            }
        })

        if (codeUsed) {
            throw new ConflictException('Código já enviado')
        }

        const generateCode = Math.floor(100000 + Math.random() * 900000).toString()

        const createCode = await this.prisma.validationCode.create({
            data: {
                type: 'Email',
                code: generateCode,
                validated: false,
                email: email.email,
                expired: false
            }
        })

        await this.sendEmailCode.sendCode(email.email, generateCode)
    }

    async validateEmailCode(email: ValidateCodeEmailDTO) {
        const codeUsed = await this.prisma.validationCode.findFirst({
            where: {
                OR: [
                    {
                        email: email.email,
                        validated: true
                    },
                    { expired: true }
                ]
            }
        })

        if(codeUsed) {
            throw new ConflictException('Código já utilizado ou expirado')
        }
    }
}
