import { registerAs } from "@nestjs/config";

export default registerAs('jwt', () => ({
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET,
        audience: process.env.JWT_TOKEN_AUDIENCE,
        issuer: process.env.JWT_TOKEN_ISSUER,
        ttl: process.env.JWT_ACCESS_TTL
    },

    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET,
        ttl: process.env.JWT_REFRESH_TTL
    }
})
)