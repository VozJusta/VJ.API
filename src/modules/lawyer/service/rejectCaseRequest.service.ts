import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { NotificationsService } from '../../notifications/service/notifications.service';
import { NotificationType } from 'generated/prisma/client';

@Injectable()
export class RejectCaseRequest {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async rejectCaseRequest(userId: string, role: string, caseRequestId: string) {
    const userRole = role.toLowerCase();

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      const caseRequest = await this.prisma.caseRequest.findUnique({
        where: { id: caseRequestId },
        include: { case: true },
      });

      if (!caseRequest) {
        throw new NotFoundException('Solicitação de caso não encontrada');
      }

      if (caseRequest.lawyer_id !== userId) {
        throw new UnauthorizedException(
          'Você não tem permissão para recusar esta solicitação',
        );
      }

      if (caseRequest.status !== 'Pending') {
        throw new BadRequestException(
          `Não é possível recusar uma solicitação com status ${caseRequest.status}`,
        );
      }

      await this.prisma.caseRequest.update({
        where: { id: caseRequestId },
        data: { status: 'Refused' },
      });

      await this.notificationsService.createNotification({
        target: { role: 'Citizen', userId: caseRequest.citizen_id },
        title: 'Solicitação de caso recusada',
        body: `Sua solicitação para o caso "${caseRequest.case.title}" foi recusada.`,
        type: NotificationType.REQUEST_REFUSED,
        metadata: {
          caseId: caseRequest.case_id,
          caseRequestId,
          lawyerId: userId,
        },
      });

      return {
        message: 'Solicitação de caso recusada com sucesso',
        caseRequestId,
      };
    }

    throw new BadRequestException('Role inválida');
  }
}