import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from '@m/auth/hash/hashing.service';
import { BcryptService } from '@m/auth/hash/bcrypt.service';
import { PrismaModule } from '@m/prisma/prisma.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '@m/auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from '@m/auth/strategies/google.strategy';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';
import { AuthTokenGuardAccess } from '@m/auth/guard/access-token.guard';
import { AuthenticateGoogleCitizenService } from '@m/auth/service/authGoogleCitizen.service';
import { AuthenticateGoogleLawyerService } from '@m/auth/service/authGoogleLawyer.service';
import { ChangePasswordService } from '@m/auth/service/changePassword.service';
import { SendEmailService } from '@m/auth/service/sendEmail.service';
import { SendForgotPasswordEmailService } from '@m/auth/service/sendForgotPassword.service';
import { LawyerInformationService } from '@m/auth/service/lawyerInformation.service';
import { AuthenticateService } from '@m/auth/service/authenticate.service';
import { ValidateEmailCodeService } from '@m/auth/service/validateEmailCode.service';
import { VerifyForgotCodeService } from '@m/auth/service/verifyForgotCode.service';
import { AuthenticateController } from '@m/auth/controllers/authenticate.controller';
import { CompleteController } from '@m/auth/controllers/complete.controller';
import { RefreshToken } from '@m/auth/controllers/refreshToken.controller';
import { ChangePasswordController } from '@m/auth/controllers/changePassword.controller';
import { ForgotController } from '@m/auth/controllers/forgot.controller';
import { GoogleController } from '@m/auth/controllers/google.controller';
import { ValidateEmailController } from '@m/auth/controllers/validateEmail.controller';
import { SendForgotEmailController } from '@m/auth/controllers/sendForgotEmail.controller';
import { SendEmailController } from '@m/auth/controllers/sendEmail.controller';
import { CititzenInformationService } from '@m/auth/service/citizenInformation.service';
import { ForgotPasswordService } from '@m/auth/service/forgotPassword.service';
import { RefreshTokenService } from '@m/auth/service/refreshToken.service';
import { userDataController } from '@m/auth/controllers/userData.controller';
import { TerminateAccountController } from '@m/auth/controllers/terminateAccount.controller';
import { TerminateAccountService } from '@m/auth/service/terminateAccount.service';
import { LogoutController } from '@m/auth/controllers/logout.controller';
import { GetUserDataService } from '@m/auth/service/getUserData.service';

@Global()
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.accessToken.secret,
      }),
    }),
    PassportModule,
  ],
  providers: [
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    },
    ChangePasswordService,
    SendEmailService,
    SendForgotPasswordEmailService,
    LawyerInformationService,
    AuthenticateService,
    ValidateEmailCodeService,
    VerifyForgotCodeService,
    CititzenInformationService,
    LawyerInformationService,
    AuthenticateGoogleLawyerService,
    AuthenticateGoogleCitizenService,
    VerifyForgotCodeService,
    ForgotPasswordService,
    GoogleStrategy,
    RefreshTokenService,
    SecurityTokenInterceptor,
    AuthTokenGuardAccess,
    TerminateAccountService,
    GetUserDataService,
  ],
  exports: [
    HashingServiceProtocol,
    JwtModule,
    AuthTokenGuardAccess,
    ConfigModule,
    SecurityTokenInterceptor,
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
    userDataController,
    TerminateAccountController,
    LogoutController,
  ],
})
export class AuthModule { }
