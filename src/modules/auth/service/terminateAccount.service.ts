import { PrismaService } from '@modules/prisma/service/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { HashingServiceProtocol } from '../hash/hashing.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TerminateAccountService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
    private readonly jwtService: JwtService,
  ) { }

  async terminateAccount(id: string, password: string) {
    try {
      if (!id) {
        throw new ConflictException('Token inválido');
      }

      if (!password) {
        throw new ConflictException('A senha é obrigatória para excluir a conta');
      }

      const citizen = await this.prisma.citizen.findUnique({ where: { id } });
      const lawyer = await this.prisma.lawyer.findUnique({ where: { id } });

      if (!citizen && !lawyer) {
        throw new ConflictException('Usuário não encontrado');
      }
      const decodePassword = await this.hashingService.compare(
        password,
        citizen?.password
          ? citizen.password
          : lawyer?.password
            ? lawyer.password
            : '',
      );

      if (!decodePassword) {
        throw new ConflictException('Senha incorreta');
      }
      if (citizen) {
        await this.prisma.citizen.delete({
          where: { id },
        });
      }
      if (lawyer) {
        await this.prisma.lawyer.delete({
          where: { id },
        });
      }

      return {
        message: 'Conta excluída permanentemente',
      };
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }
}
