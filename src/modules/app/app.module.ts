import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CitizenModule } from 'src/modules/user/citizen.module';
import { LawyerModule } from 'src/modules/lawyer/lawyer.module';
import { ValidationModule } from 'src/modules/validation/validation.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config'
import { EmailModule } from 'src/modules/email/email.module';
import { SmsModule } from 'src/modules/sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CitizenModule,
    LawyerModule,
    ValidationModule,
    AuthModule,
    EmailModule,
    SmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
