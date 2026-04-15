import { Global, Module } from '@nestjs/common';
import { ResendProvider } from '@m/email/config/resend.config';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@m/prisma/prisma.module';
import { SendCodeEmailService } from '@m/email/service/sendCode.service';
import { SendForgotPasswordCodeService } from '@m/email/service/sendForgotPasswordCode.service';

@Global()
@Module({
    imports: [ConfigModule, PrismaModule],
    providers: [SendCodeEmailService,SendForgotPasswordCodeService , ResendProvider],
    exports: [SendCodeEmailService,SendForgotPasswordCodeService]
})
export class EmailModule {}
