import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { CompleteLawyerRegisterDTO } from '@m/auth/dto/complete-lawyer-register.dto';
import { HashingServiceProtocol } from '@m/auth/hash/hashing.service';

interface SecurityTokenPayload {
  sub: string;
  role: 'Citizen' | 'Lawyer';
  sessionId: string;
}

@Injectable()
export class LawyerInformationService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
    private readonly jwtService: JwtService,
  ) {}

  async completeLawyerInformation(
    body: CompleteLawyerRegisterDTO,
    token: string,
  ) {
    try {
      const payload = await this.jwtService.verify<SecurityTokenPayload>(token);

      const { sub, role, sessionId } = payload;

      if (role === 'Citizen') {
        throw new UnauthorizedException('Usuário não permitido');
      }

      const datasAlreadyExists = await this.prisma.lawyer.findFirst({
        where: {
          OR: [
            { cpf: body.cpf },
            {
              oab_number: body.oabNumber,
              oab_state: body.oabState,
            },
            { phone: body.phone },
          ],
        },
      });

      if (datasAlreadyExists) {
        throw new ConflictException('Dados já cadastrados');
      }

      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: sub },
        select: { session_id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (lawyer.session_id !== sessionId) {
        throw new UnauthorizedException(
          'Sessão expirada, faça login novamente',
        );
      }

      const hashedPassword = await this.hashingService.hash(body.password);

      await this.prisma.lawyer.update({
        where: { id: sub },
        data: {
          cpf: body.cpf,
          oab_number: body.oabNumber,
          oab_state: body.oabState,
          specialization: body.specialization,
          phone: body.phone,
          password: hashedPassword,
        },
      });

      return {
        message: 'Dados atualizados com sucesso',
      };
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
