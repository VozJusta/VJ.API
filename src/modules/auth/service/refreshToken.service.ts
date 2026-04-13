import { Inject, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/modules/prisma/service/prisma.service";

export class RefreshTokenService {
    constructor(private prisma: PrismaService,
        @Inject('JWT_SECRET') private readonly jwt_access: JwtService,
        @Inject('REFRESH_TOKEN_SECRET') private readonly jwtRefresh: JwtService
    ) { }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtRefresh.verify<tokenLoginType>(refreshToken)
            const { role, id } = payload

            let user;

            if (role === 'citizen') {
                user = await this.prisma.citizen.findUnique({ where: { id: id } });
            } else {
                user = await this.prisma.lawyer.findUnique({ where: { id: id } });
            }

            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }

            const newPayload = {
                id: user.id,
                email: user.email,
                role: role,
                username: user.username,
                created_at: user.created_at,
            };

            return {
                access_token: this.jwt_access.sign(newPayload, { expiresIn: '15m' }),
                refresh_token: this.jwtRefresh.sign(newPayload, { expiresIn: '7d' }),
            };
        } catch (error) {
            throw new UnauthorizedException('Refresh token está inválido ou expirado');
        }

    }
}