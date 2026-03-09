import { ConflictException, Inject, Injectable, NotFoundException, RequestTimeoutException, UnauthorizedException } from '@nestjs/common';
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

        const passwordMatch = await this.hashingService.compare(body.password, user.password || '')

        if (!passwordMatch) {
            throw new UnauthorizedException('Email/senha incorretos')
        }

        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                name: user.full_name,
                role: 'User'
            },
            {
                secret: this.jwtConfiguration.accessToken.secret,
                expiresIn: this.jwtConfiguration.accessToken.ttl as any,
                audience: this.jwtConfiguration.accessToken.audience,
                issuer: this.jwtConfiguration.accessToken.issuer
            }
        )

        const refreshToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                name: user.full_name,
                role: 'User'
            },
            {
                secret: this.jwtConfiguration.refreshToken.secret,
                expiresIn: this.jwtConfiguration.refreshToken.ttl as any
            }
        )        

        return {
            access_token: accessToken,
            refresh_token: refreshToken
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

        const accessToken = await this.jwtService.signAsync(
            {
                sub: lawyer.id,
                email: lawyer.email,
                name: lawyer.full_name,
                role: 'Lawyer'
            },
            {
                secret: this.jwtConfiguration.accessToken.secret,
                expiresIn: this.jwtConfiguration.accessToken.ttl as any,
                audience: this.jwtConfiguration.accessToken.audience,
                issuer: this.jwtConfiguration.accessToken.issuer
            }
        )

        const refreshToken = await this.jwtService.signAsync(
            {
                sub: lawyer.id,
                email: lawyer.email,
                name: lawyer.full_name,
                role: 'Lawyer'
            },
            {
                secret: this.jwtConfiguration.refreshToken.secret,
                expiresIn: this.jwtConfiguration.refreshToken.ttl as any
            }
        )

        return {
            access_token: accessToken,
            refresh_token: refreshToken
        }
    }

    async sendEmail(email: SendCodeEmailDTO) {
        const codeUsed = await this.prisma.validationCode.findFirst({
            where: {
                email: email.email,
                validated: false,
                expired: false
            }
        })

        if (codeUsed) {
            throw new ConflictException('Código já enviado')
        }

        const generateCode = Math.floor(100000 + Math.random() * 900000).toString()

        await this.prisma.validationCode.create({
            data: {
                type: 'Email',
                code: generateCode,
                validated: false,
                email: email.email,
                expired: false
            }
        })

        await this.sendEmailCode.sendCode(email.email, generateCode)

        return `Código enviado para o email ${email.email}`
    }

    async validateEmailCode(body: ValidateCodeEmailDTO) {
        const codeExpired = await this.prisma.validationCode.findFirst({
            where: {
                email: body.email,
                code: body.code,
                validated: false,
                expired: false
            }
        })

        if (codeExpired?.created_at) {
            const createdAt = new Date(codeExpired.created_at);
            const now = new Date();

            const diffInMs = now.getTime() - createdAt.getTime();
            const diffInMinutes = diffInMs / (1000 * 60);

            if (diffInMinutes > 15) {
                await this.prisma.validationCode.update({
                    where: { id: codeExpired.id },
                    data: {
                        expired: true
                    }
                })
            }
        }

        const codeValid = await this.prisma.validationCode.findFirst({
            where: {
                email: body.email,
                code: body.code,
                validated: false,
                expired: false
            }
        })


        if (!codeValid) {
            throw new UnauthorizedException('Código inválido')
        }

        const validateCode = await this.prisma.validationCode.update({
            where: {
                id: codeValid.id
            },
            data: {
                validated: true,
                expired: false
            }
        })

        return 'Código válidado com sucesso'
    }

    async authenticateGoogle(email: string, name: string) {

        let user = await this.prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: email,
                    full_name: name,
                }
            })
        }

        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                name: user.full_name,
                role: 'User'
            },
            {
                secret: this.jwtConfiguration.accessToken.secret,
                expiresIn: this.jwtConfiguration.accessToken.ttl as any,
                audience: this.jwtConfiguration.accessToken.audience,
                issuer: this.jwtConfiguration.accessToken.issuer
            }
        )

        const refreshToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                name: user.full_name,
                role: 'User'
            },
            {
                secret: this.jwtConfiguration.refreshToken.secret,
                expiresIn: this.jwtConfiguration.refreshToken.ttl as any
            }
        )

        return {
            access_token: accessToken,
            refresh_token: refreshToken
        }
    }
}
