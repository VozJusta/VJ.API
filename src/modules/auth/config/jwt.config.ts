import { registerAs } from "@nestjs/config";

export default registerAs('jwt', () => ({
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET as string,
        audience: process.env.JWT_TOKEN_AUDIENCE,
        issuer: process.env.JWT_TOKEN_ISSUER,
        ttl: process.env.JWT_ACCESS_TTL as `${number}${'s' | 'm' | 'h' | 'd'}`
    },

    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET,
        ttl: process.env.JWT_REFRESH_TTL
    }
})
)