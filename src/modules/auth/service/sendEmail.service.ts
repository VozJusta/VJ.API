import { EmailService } from "src/modules/email/service/email.service";
import { PrismaService } from "src/modules/prisma/service/prisma.service";
import { SendCodeEmailDTO } from "../dto/sendCode-email.dto";
import { ConflictException, Injectable } from "@nestjs/common";

@Injectable()
export class SendEmailService {
  constructor(
    private prisma: PrismaService,
    private readonly sendEmailCode: EmailService,
  ) {}
  async sendEmail(email: SendCodeEmailDTO) {
    const codeUsed = await this.prisma.validationCode.findFirst({
      where: {
        email: email.email,
        validated: false,
        expired: false,
      },
    });

    if (codeUsed) {
      const createdAt = new Date(codeUsed.created_at);
      const now = new Date();

      const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      if (diffInMinutes > 15) {
        await this.prisma.validationCode.update({
          where: { id: codeUsed.id },
          data: { expired: true },
        });
      } else {
        throw new ConflictException('Código já enviado');
      }
    }

    const generateCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.validationCode.create({
      data: {
        type: 'Email',
        code: generateCode,
        validated: false,
        email: email.email,
        expired: false,
      },
    });

    await this.sendEmailCode.sendCode(email.email, generateCode);

    return `Código enviado para o email ${email.email}`;
  }
}
