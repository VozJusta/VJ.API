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
import { SendCodeEmailDTO } from '../dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from '../dto/validateCode-email.dto';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { VerifyForgotCodeDTO } from '../dto/verify-forgot-code.dto';
import e from 'express';
import { CompleteCitizenRegisterDTO } from '../dto/complete-citizen-register.dto';
import { CompleteLawyerRegisterDTO } from '../dto/complete-lawyer-register.dto';
import { ChangePasswordDTO } from '../dto/change-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol,
        private readonly sendEmailCode: EmailService,

        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtService: JwtService
    ) { }

    async changePassword(body: ChangePasswordDTO, userId: string) {
        const citizen = await this.prisma.citizen.findFirst({
            where: { id: userId }
        })

        const lawyer = !citizen ? await this.prisma.lawyer.findFirst({
            where: { id: userId }
        }) : null

        const user = citizen || lawyer
        const userType = citizen ? 'citizen' : 'lawyer'

        if (!user) {
            throw new NotFoundException('Usuário não encontrado')
        }

        const wrongPassword = await this.hashingService.compare(body.currentPassword, user.password || '')

        if (!wrongPassword) {
            throw new UnauthorizedException('Senha incorreta')
        }

        const samePassword = await this.hashingService.compare(body.newPassword, user.password || '')

        if (samePassword) {
            throw new ConflictException('Senha não pode ser igual a anterior')
        }

        const hashedPassword = await this.hashingService.hash(body.newPassword)

        if (userType === 'citizen') {
            await this.prisma.citizen.update({
                where: { id: userId },
                data: { password: hashedPassword }
            })
        } else {
            await this.prisma.lawyer.update({
                where: { id: userId },
                data: { password: hashedPassword }
            })
        }

        return {
            message: 'Senha atualizada com sucesso'
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
