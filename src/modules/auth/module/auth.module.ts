import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from '../hash/hashing.service';
import { BcryptService } from '../hash/bcrypt.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from '../strategies/google.strategy';
import { SecurityTokenInterceptor } from '../interceptors/security-token.interceptor';
import { AuthTokenGuard } from '../guard/access-token.guard';
import { AuthenticateGoogleCitizenService } from '../service/authGoogleCitizen.service'
import { AuthenticateGoogleLawyerService } from '../service/authGoogleLawyer.service';
import { ChangePasswordService } from '../service/changePassword.service';
import { SendEmailService } from '../service/sendEmail.service';
import { SendForgotPasswordEmailService } from '../service/sendForgotPassword.service';
import { LawyerInformationService } from '../service/lawyerInformation.service';
import { AuthenticateService } from '../service/authenticate.service';
import { ValidateEmailCodeService } from '../service/validateEmailCode.service';
import { VerifyForgotCodeService } from '../service/verifyForgotCode.service';
import { CitizenService } from 'src/modules/user/service/citizen.service';
import { AuthenticateController } from '../controllers/authenticate.controller';
import { CompleteController } from '../controllers/complete.controller';
import { RefreshToken } from '../controllers/refreshToken.controller';
import { ChangePasswordController } from '../controllers/changePassword.controller';
import { ForgotController } from '../controllers/forgot.controller';
import { GoogleController } from '../controllers/google.controller';
import { ValidateEmailController } from '../controllers/validateEmail.controller';
import { SendForgotEmailController } from '../controllers/sendForgotEmail.controller';
import { SendEmailController } from '../controllers/sendEmail.controller';



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
        ChangePasswordService,
        SendEmailService,
        SendForgotPasswordEmailService,
        LawyerInformationService,
        AuthenticateService,
        ValidateEmailCodeService,
        VerifyForgotCodeService,
        CitizenService,

        AuthenticateGoogleLawyerService,
        AuthenticateGoogleCitizenService,
        GoogleStrategy,
        SecurityTokenInterceptor,
        AuthTokenGuard,
    ],
    exports: [
        HashingServiceProtocol, 
        JwtModule, 
        AuthTokenGuard, 
        ConfigModule, 
        SecurityTokenInterceptor
    ],
    controllers: [
        AuthenticateController, 
        CompleteController, 
        RefreshToken, 
        ChangePasswordController, 
        ForgotController, 
        GoogleController, 
        ValidateEmailController, 
        SendForgotEmailController, 
        SendEmailController, 
    ]
})
export class AuthModule { }
