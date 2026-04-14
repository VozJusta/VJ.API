import { Global, Module } from '@nestjs/common';
import { SmsService } from '@m/sms/service/sms.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TwilioProvider } from '@m/sms/config/twilio.config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SmsService, TwilioProvider],
  exports: [SmsService],
})
export class SmsModule {}
