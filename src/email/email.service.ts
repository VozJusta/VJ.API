import { Inject, Injectable } from '@nestjs/common';
import { Resend } from 'resend'

@Injectable()
export class EmailService {
    constructor(
        @Inject('RESEND_CLIENT')
        private readonly resend: Resend,
    ) {}

    async sendCode(email: string) {
        return await this.resend.emails.send({
            from: 'contato@vozjusta.com.br',
            to: email,
            subject: 'Teste',
            html: '<strong>Funcionando!</strong>'
        })
    }
}
