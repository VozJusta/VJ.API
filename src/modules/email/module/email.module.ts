import { Global, Module } from '@nestjs/common';
import { ResendProvider } from '../config/resend.config';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SendCodeEmailService } from '../service/sendCode.service';
import { SendForgotPasswordCodeService } from '../service/sendForgotPasswordCode.service';

@Global()
@Module({
    imports: [ConfigModule, PrismaModule],
    providers: [SendCodeEmailService,SendForgotPasswordCodeService , ResendProvider],
    exports: [SendCodeEmailService,SendForgotPasswordCodeService]
})
export class EmailModule {}
