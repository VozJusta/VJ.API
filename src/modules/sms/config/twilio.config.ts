import { ConfigService } from "@nestjs/config";
import Twilio from 'twilio'

export const TwilioProvider = {
    provide: 'TWILIO_PROVIDER',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        return Twilio(configService.get<string>('TWILIO_SID'),
            configService.get<string>('TWILIO_TOKEN'))
    }
}