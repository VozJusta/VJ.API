import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
    constructor(private readonly http: HttpService) {}

    sendSms(phone: string) {
        return this.http.post('https://textbelt.com/text', {
            phone: phone,
            message: 'Olá mundo',
            key: 'textbelt'
        })
    }
}
