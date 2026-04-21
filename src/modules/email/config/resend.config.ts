import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

export const ResendProvider = {
    provide: 'RESEND_CLIENT',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        return new Resend(configService.get<string>('RESEND_API_KEY'))
    }
}