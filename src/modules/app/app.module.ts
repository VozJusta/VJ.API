import { Module } from '@nestjs/common';
import { CitizenModule } from '@m/user/module/citizen.module';
import { LawyerModule } from '@m/lawyer/module/lawyer.module';
import { ValidationModule } from '@m/validation/module/validation.module';
import { AuthModule } from '@m/auth/module/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '@m/email/module/email.module';
import { SmsModule } from '@m/sms/module/sms.module';
import { AiModule } from '@m/ai/module/ai.module';
import { DashboardModule } from '@m/dashboard/module/dashboard.module';
import { RouterModule } from '@nestjs/core';

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
    RouterModule.register([
      {
        path: '/auth',
        module: AuthModule,
      },
      {
        path: '/dashboard',
        module: DashboardModule,
      },
    ]),
  ],
})
export class AppModule {}
