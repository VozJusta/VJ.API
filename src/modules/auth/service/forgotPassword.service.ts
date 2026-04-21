import { UnauthorizedException, NotFoundException, Injectable } from "@nestjs/common";
import { PrismaService } from "@m/prisma/service/prisma.service";
import { ForgotPasswordDTO } from "@m/auth/dto/forgot-password.dto";
import { HashingServiceProtocol } from "@m/auth/hash/hashing.service";

@Injectable()
export class ForgotPasswordService {
    constructor(private prisma: PrismaService, private hashingService: HashingServiceProtocol) { }

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