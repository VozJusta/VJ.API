import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { SignInDTO } from '@m/auth/dto/signIn.dto';
import { HashingServiceProtocol } from '@m/auth/hash/hashing.service';

@Injectable()
export class AuthenticateService {
  constructor(
    private prisma: PrismaService,
    private hashingService: HashingServiceProtocol,
  ) {}
  async authenticate(body: SignInDTO) {
    const citizen = await this.prisma.citizen.findFirst({
      where: { email: body.email },
    });

    const lawyer = !citizen
      ? await this.prisma.lawyer.findFirst({
          where: { email: body.email },
        })
      : null;

    const user = citizen || lawyer;

    if (!user) {
      throw new UnauthorizedException('Email/senha incorretos');
    }

    const passwordMatch = await this.hashingService.compare(
      body.password,
      user.password || '',
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Email/senha incorretos');
    }

    const role = citizen ? 'Citizen' : 'Lawyer';
    const sessionId = randomUUID();

    if (citizen) {
      await this.prisma.citizen.update({
        where: { id: user.id },
        data: { session_id: sessionId },
      });
    } else {
      await this.prisma.lawyer.update({
        where: { id: user.id },
        data: { session_id: sessionId },
      });
    }

    return {
      validated: true,
      sub: user.id,
      role,
      email: user.email,
      full_name: user.full_name,
      loggedWithGoogle: false,
      sessionId,
    };
  }
}
