import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@m/prisma/service/prisma.service';

@Injectable()
export class AuthenticateGoogleLawyerService {
  constructor(private prisma: PrismaService) {}
  async authenticateGoogleLawyer(email: string, name: string) {
    const sessionId = randomUUID();
    let lawyer = await this.prisma.lawyer.findFirst({
      where: {
        email: email,
      },
    });

    if (!lawyer) {
      lawyer = await this.prisma.lawyer.create({
        data: {
          email: email,
          full_name: name,
          session_id: sessionId,
        },
      });

      return {
        validated: true,
        sub: lawyer.id,
        role: 'Lawyer',
        email: lawyer.email,
        full_name: lawyer.full_name,
        loggedWithGoogle: true,
        registerCompleted: false,
        sessionId,
      };
    }

    await this.prisma.lawyer.update({
      where: { id: lawyer.id },
      data: { session_id: sessionId },
    });

    return {
      validated: true,
      sub: lawyer.id,
      role: 'Lawyer',
      email: lawyer.email,
      full_name: lawyer.full_name,
      loggedWithGoogle: true,
      registerCompleted: true,
      sessionId,
    };
  }
}
