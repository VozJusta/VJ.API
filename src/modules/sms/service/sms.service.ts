import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
    constructor(
        @Inject('TWILIO_PROVIDER')
        private readonly twilio: Twilio
    ) {}

    sendSms(phone: string) {
        return this.twilio.messages.create({
            to: phone,
            from: process.env.TWILIO_PHONE,
            body: '123456'
        })
    }
}
