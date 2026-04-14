import { Module } from '@nestjs/common';
import { CitizenModule } from 'src/modules/user/citizen.module';
import { LawyerModule } from 'src/modules/lawyer/module/lawyer.module';
import { ValidationModule } from 'src/modules/validation/validation.module';
import { AuthModule } from 'src/modules/auth/module/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/modules/email/module/email.module';
import { SmsModule } from 'src/modules/sms/module/sms.module';
import { AiModule } from '../ai/ai.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CitizenModule,
    LawyerModule,
    ValidationModule,
    AuthModule,
    EmailModule,
    SmsModule,
    AiModule,
    DashboardModule,
  ],
})
export class AppModule {}
