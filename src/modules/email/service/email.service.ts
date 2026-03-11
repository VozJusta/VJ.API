import { Inject, Injectable } from '@nestjs/common';
import path from 'path';
import { Resend } from 'resend'
import fs from 'fs-extra';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
    constructor(
        @Inject('RESEND_CLIENT')
        private readonly resend: Resend,
    ) { }

    async sendCode(email: string, code: string) {
        const templatePath = path.join(
            __dirname,
            '..',
            'src',
            'modules',
            'email',
            'code.hbs',
        );

        const templateSource = await fs.readFile(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);

        const html = template({code: code})

        return await this.resend.emails.send({
            from: 'contato@vozjusta.com.br',
            to: email,
            subject: 'Teste',
            html: html
        })
    }
}
