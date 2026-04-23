import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { CompleteCitizenRegisterDTO } from '@m/auth/dto/complete-citizen-register.dto';
import { HashingServiceProtocol } from '@m/auth/hash/hashing.service';
import { TokensPayload } from '@m/common/interfaces/interfaces';



@Injectable()
export class CititzenInformationService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
    private readonly jwtService: JwtService,
  ) {}

  async completeCitizenInformation(
    body: CompleteCitizenRegisterDTO,
    token: string,
  ) {
    try {
      const payload = await this.jwtService.verify<TokensPayload>(token);

      const { sub, role, sessionId } = payload;

      if (role === 'Lawyer') {
        throw new UnauthorizedException('Usuário não permitido');
      }

      const datasAlreadyExists = await this.prisma.citizen.findFirst({
        where: {
          OR: [{ cpf: body.cpf }, { phone: body.phone }],
        },
      });

      if (datasAlreadyExists) {
        throw new ConflictException('Dados já cadastrados');
      }

      const citizen = await this.prisma.citizen.findFirst({
        where: { id: sub },
        select: { session_id: true },
      });

      if (!citizen) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (citizen.session_id !== sessionId) {
        throw new UnauthorizedException(
          'Sessão expirada, faça login novamente',
        );
      }

      const hashedPassword = await this.hashingService.hash(body.password);

      await this.prisma.citizen.update({
        where: { id: sub },
        data: {
          cpf: body.cpf,
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
