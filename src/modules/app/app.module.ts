import { Module } from '@nestjs/common';
import { CitizenModule } from '@modules/citizen/module/citizen.module';
import { LawyerModule } from '@m/lawyer/module/lawyer.module';
import { ValidationModule } from '@m/validation/module/validation.module';
import { AuthModule } from '@m/auth/module/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '@m/email/module/email.module';
import { SmsModule } from '@m/sms/module/sms.module';
import { AiModule } from '@m/ai/module/ai.module';
import { DashboardModule } from '@m/dashboard/module/dashboard.module';
import { RouterModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { SimulationModule } from '@modules/simulations/simulation.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        redis: {
          host: process.env.UPSTASH_URL,
          port: 6379,
          password: process.env.UPSTASH_PASSWORD,
          tls: {
            rejectUnauthorized: false,
          },  
          maxRetriesPerRequest: null, 
          enableReadyCheck: false,    
        },
      }),
    }),
    CitizenModule,
    LawyerModule,
    ValidationModule,
    AuthModule,
    EmailModule,
    SmsModule,
    AiModule,
    DashboardModule,
    SimulationModule,
    RouterModule.register([
      {
        path: '/auth',
        module: AuthModule,
      },
      {
        path: '/dashboard',
        module: DashboardModule,
      },
      {
        path: '/simulation',
        module: SimulationModule,
      },
      {
        path: '/report',
        module: AiModule,
      },
    ]),
  ],
  controllers: [AppController],
})
export class AppModule { }
