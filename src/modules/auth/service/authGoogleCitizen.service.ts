import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@m/prisma/service/prisma.service';

@Injectable()
export class AuthenticateGoogleCitizenService {
  constructor(private prisma: PrismaService) {}

  async authenticateGoogleCitizen(email: string, name: string) {
    const sessionId = randomUUID();
    let citizen = await this.prisma.citizen.findFirst({
      where: {
        email: email,
      },
    });

    if (!citizen) {
      citizen = await this.prisma.citizen.create({
        data: {
          email: email,
          full_name: name,
          session_id: sessionId,
        },
      });

      return {
        validated: true,
        sub: citizen.id,
        role: 'Citizen',
        email: citizen.email,
        full_name: citizen.full_name,
        loggedWithGoogle: true,
        registerCompleted: false,
        sessionId,
      };
    }

    await this.prisma.citizen.update({
      where: { id: citizen.id },
      data: { session_id: sessionId },
    });

    return {
      validated: true,
      sub: citizen.id,
      role: 'Citizen',
      email: citizen.email,
      full_name: citizen.full_name,
      loggedWithGoogle: true,
      registerCompleted: true,
      sessionId,
    };
  }
}
