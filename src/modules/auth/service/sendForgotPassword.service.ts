import { ConflictException, Injectable } from "@nestjs/common";
import { SendForgotPasswordCodeService } from "@m/email/service/sendForgotPasswordCode.service";
import { PrismaService } from "@m/prisma/service/prisma.service";
import { SendCodeEmailDTO } from "@m/auth/dto/sendCode-email.dto";

@Injectable()
export class SendForgotPasswordEmailService {
  constructor(
    private prisma: PrismaService,
    private readonly sendEmailCode: SendForgotPasswordCodeService,
  ) { }

  async sendForgotPasswordEmail(email: SendCodeEmailDTO) {
    const citizen = await this.prisma.citizen.findFirst({
      where: {
        email: email.email,
      },
    });

    const lawyer = !citizen
      ? await this.prisma.lawyer.findFirst({
        where: {
          email: email.email,
        },
      })
      : null;

    if (!citizen && !lawyer) {
      return `Código de recuperação enviado para o email ${email.email}`;
    }

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
    await this.sendEmailCode.sendForgotPasswordCode(email.email, generateCode);

    return `Código de recuperação enviado para o email ${email.email}`;
  }
}
