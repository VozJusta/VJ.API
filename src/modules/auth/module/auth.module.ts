import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from './hash/hashing.service';
import { BcryptService } from './hash/bcrypt.service';
import { AuthController } from '../auth/controllers/auth.controller';
import { AuthService } from './service/auth.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { SecurityTokenInterceptor } from './interceptors/security-token.interceptor';
import { AuthTokenGuard } from './guard/access-token.guard';

@Global()
@Module({
    imports: [
        PrismaModule,
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync({
            imports: [ConfigModule.forFeature(jwtConfig)],
            inject: [jwtConfig.KEY],
            useFactory: (config: ConfigType<typeof jwtConfig>) => ({
                secret: config.accessToken.secret
            }),
        }),
        PassportModule,
    ],
    providers: [
        {
            provide: HashingServiceProtocol,
            useClass: BcryptService
        },
        AuthService,
        GoogleStrategy,
        SecurityTokenInterceptor,
        AuthTokenGuard,
    ],
    exports: [HashingServiceProtocol, JwtModule, AuthTokenGuard, ConfigModule, SecurityTokenInterceptor],
    controllers: [AuthController]
})
export class AuthModule {}
