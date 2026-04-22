import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "@m/prisma/service/prisma.service";
import { VerifyForgotCodeDTO } from "@m/auth/dto/verify-forgot-code.dto";

@Injectable()
export class VerifyForgotCodeService {
    constructor(private prisma: PrismaService) { }

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
}