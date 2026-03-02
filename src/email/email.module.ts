import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { Resend } from 'resend';
import { ResendProvider } from './resend.config';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';

@Global()
@Module({
    imports: [ConfigModule, PrismaModule],
    providers: [EmailService, ResendProvider],
    exports: [EmailService]
})
export class EmailModule {}
