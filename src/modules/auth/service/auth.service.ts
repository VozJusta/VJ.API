import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';
import { HashingServiceProtocol } from '../hash/hashing.service';
import { SignInDTO } from '../dto/signIn.dto';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/modules/email/service/email.service';
import { SmsService } from 'src/modules/sms/service/sms.service';
import { SendCodeEmailDTO } from '../dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from '../dto/validateCode-email.dto';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { VerifyForgotCodeDTO } from '../dto/verify-forgot-code.dto';
import e from 'express';

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

    async authenticate(body: SignInDTO) {
        const citizen = await this.prisma.citizen.findFirst({
            where: { email: body.email }
        })

        const lawyer = !citizen ? await this.prisma.lawyer.findFirst({
            where: { email: body.email }
        }) : null

        const user = citizen || lawyer

        if (!user) {
            throw new UnauthorizedException('Email/senha incorretos')
        }

        const passwordMatch = await this.hashingService.compare(body.password, user.password || '')

        if (!passwordMatch) {
            throw new UnauthorizedException('Email/senha incorretos')
        }

        const role = citizen ? 'Citizen' : 'Lawyer'

        return {
            validated: true,
            sub: user.id,
            role,
            email: user.email,
            full_name: user.full_name,
            loggedWithGoogle: false
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
            const createdAt = new Date(codeUsed.created_at)
            const now = new Date()

            const diffInMinutes =
                (now.getTime() - createdAt.getTime()) / (1000 * 60)

            if (diffInMinutes > 15) {
                await this.prisma.validationCode.update({
                    where: { id: codeUsed.id },
                    data: { expired: true }
                })
            } else {
                throw new ConflictException('Código já enviado')
            }
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

    async sendForgotPasswordEmail(email: SendCodeEmailDTO) {
        const citizen = await this.prisma.citizen.findFirst({
            where: {
                email: email.email,
            },
        })

        const lawyer = !citizen ? await this.prisma.lawyer.findFirst({
            where: {
                email: email.email,
            },
        }) : null

        if (!citizen && !lawyer) {
            return `Código de recuperação enviado para o email ${email.email}`;
        }

        const codeUsed = await this.prisma.validationCode.findFirst({
            where: {
                email: email.email,
                validated: false,
                expired: false
            }
        })

        if (codeUsed) {
            const createdAt = new Date(codeUsed.created_at)
            const now = new Date()

            const diffInMinutes =
                (now.getTime() - createdAt.getTime()) / (1000 * 60)

            if (diffInMinutes > 15) {
                await this.prisma.validationCode.update({
                    where: { id: codeUsed.id },
                    data: { expired: true }
                })
            } else {
                throw new ConflictException('Código já enviado')
            }
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
        await this.sendEmailCode.sendForgotPasswordCode(email.email, generateCode);

        return `Código de recuperação enviado para o email ${email.email}`;
    }

    async validateEmailCode(body: ValidateCodeEmailDTO, token: string) {
        try {
            const payload = await this.jwtService.verify(token)

            const { sub, email, fullName, role, loggedWithGoogle } = payload

            const code = await this.prisma.validationCode.findFirst({
                where: {
                    email: body.email,
                    code: body.code,
                    validated: false,
                    expired: false
                }
            })

            if (!code) {
                throw new UnauthorizedException('Código inválido')
            }

            const createdAt = new Date(code.created_at)
            const now = new Date()

            const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

            if (diffInMinutes > 15) {

                await this.prisma.validationCode.update({
                    where: { id: code?.id },
                    data: { expired: true }
                })

                throw new UnauthorizedException('Código expirado')
            }

            await this.prisma.validationCode.update({
                where: { id: code?.id },
                data: {
                    validated: true,
                    expired: false,
                }
            })

            const newPayload = {
                sub,
                email,
                fullName,
                role,
                loggedWithGoogle
            }

            const accessToken = await this.jwtService.signAsync(newPayload, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: process.env.JWT_ACCESS_TTL as any,
                audience: process.env.JWT_TOKEN_AUDIENCE,
                issuer: process.env.JWT_TOKEN_ISSUER
            })

            const refreshToken = await this.jwtService.signAsync(newPayload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_TTL as any
            })

            return {
                access_token: accessToken,
                refresh_token: refreshToken
            }
        } catch(err) {
            throw new UnauthorizedException(err)
        }
    }

    async authenticateGoogleCitizen(email: string, name: string) {
        let citizen = await this.prisma.citizen.findFirst({
            where: {
                email: email
            }
        })

        if (!citizen) {
            citizen = await this.prisma.citizen.create({
                data: {
                    email: email,
                    full_name: name,
                }
            })

            return {
                validated: true,
                sub: citizen.id,
                role: 'Citizen',
                email: citizen.email,
                full_name: citizen.full_name,
                loggedWithGoogle: true,
                registerCompleted: false
            }
        }

        return {
            validated: true,
            sub: citizen.id,
            role: 'Citizen',
            email: citizen.email,
            full_name: citizen.full_name,
            loggedWithGoogle: true,
            registerCompleted: true
        }
    }

    async authenticateGoogleLawyer(email: string, name: string) {

        let lawyer = await this.prisma.lawyer.findFirst({
            where: {
                email: email
            }
        })

        if (!lawyer) {
            lawyer = await this.prisma.lawyer.create({
                data: {
                    email: email,
                    full_name: name,
                }
            })

            return {
                validated: true,
                sub: lawyer.id,
                role: 'Lawyer',
                email: lawyer.email,
                full_name: lawyer.full_name,
                loggedWithGoogle: true,
                registerCompleted: false
            }
        }

        return {
            validated: true,
            sub: lawyer.id,
            role: 'Lawyer',
            email: lawyer.email,
            full_name: lawyer.full_name,
            loggedWithGoogle: true,
            registerCompleted: true
        }
    }
    async verifyForgotCode(body: VerifyForgotCodeDTO) {
        const code = await this.prisma.validationCode.findFirst({
            where: {
                email: body.email,
                code: body.code,
                validated: false,
                expired: false,
            },
        });

        if (!code) {
            throw new UnauthorizedException('Código inválido');
        }

        const createdAt = new Date(code.created_at);
        const now = new Date();
        const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

        if (diffInMinutes > 15) {
            await this.prisma.validationCode.update({
                where: { id: code.id },
                data: { expired: true },
            });

            throw new UnauthorizedException('Código expirado');
        }

        await this.prisma.validationCode.update({
            where: { id: code.id },
            data: {
                validated: true,
            },
        });

        return {
            message: 'Código validado com sucesso',
        };
    }

    async forgotPassword(body: ForgotPasswordDTO) {
        const validatedCode = await this.prisma.validationCode.findFirst({
            where: {
                email: body.email,
                validated: true,
                expired: false,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        if (!validatedCode) {
            throw new UnauthorizedException('Código não validado para este email');
        }

        const createdAt = new Date(validatedCode.created_at);
        const now = new Date();
        const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

        if (diffInMinutes > 15) {
            await this.prisma.validationCode.update({
                where: { id: validatedCode.id },
                data: { expired: true },
            });

            throw new UnauthorizedException('Código expirado');
        }

        const hashedPassword = await this.hashingService.hash(body.new_password);

        const user = await this.prisma.citizen.findFirst({
            where: {
                email: body.email,
            },
        });

        const lawyer = await this.prisma.lawyer.findFirst({
            where: {
                email: body.email,
            },
        });

        if (!user && !lawyer) {
            throw new NotFoundException('Usuário não encontrado');
        }

        if (user) {
            await this.prisma.citizen.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
        }

        if (lawyer) {
            await this.prisma.lawyer.update({
                where: { id: lawyer.id },
                data: { password: hashedPassword },
            });
        }

        await this.prisma.validationCode.update({
            where: { id: validatedCode.id },
            data: {
                expired: true,
            },
        });

        return {
            message: 'Senha alterada com sucesso',
        };
    }
}
