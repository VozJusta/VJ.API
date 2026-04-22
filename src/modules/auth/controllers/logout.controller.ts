import { PrismaService } from "@modules/prisma/service/prisma.service";
import { ConflictException, Controller, Headers, HttpCode, Post } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RedisService } from "@m/auth/service/redis.service";


@Controller()
export class LogoutController {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private redis: RedisService,
    ) { }
    @Post('/logout')
    @HttpCode(201)
    async logout(
        @Headers('token') token: string,
        @Headers('authorization') authorization: string,
        @Headers('refreshToken') refreshTokenHeader: string,
    ) {
        try {
            const accessToken = this.extractToken(token, authorization);
            const refreshToken = this.extractToken(refreshTokenHeader);

            if (accessToken) {
                await this.revokeToken(accessToken);
            }

            if (refreshToken) {
                await this.revokeToken(refreshToken);
            }

            return{
                message: 'Logout realizado com sucesso'
            }
        } catch (error) {
            throw new ConflictException('Token inválido');
        }
    }

    private extractToken(primary?: string, authorization?: string): string | undefined {
        const source = primary ?? authorization;

        if (!source || typeof source !== 'string') {
            return undefined;
        }

        if (source.startsWith('Bearer ')) {
            return source.split(' ')[1];
        }

        return source;
    }

    private async revokeToken(token: string): Promise<void> {
        const decoded = this.jwtService.decode(token) as { exp?: number } | null;
        const exp = decoded?.exp;

        if (!exp) {
            return;
        }

        const ttl = exp - Math.floor(Date.now() / 1000);

        if (ttl > 0) {
            await this.redis.set(token, 'revoked', {
                EX: ttl,
            });
        }
    }
}