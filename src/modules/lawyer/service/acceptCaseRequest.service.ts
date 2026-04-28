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
export class AcceptCaseRequest {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async acceptCaseRequest(userId: string, role: string, caseRequestId: string) {
    const userRole = role.toLowerCase();

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      const { updatedCase, caseRequest } = await this.prisma.$transaction(async (prisma) => {
        const caseRequest = await prisma.caseRequest.findUnique({
          where: { id: caseRequestId },
          include: { case: true },
        });

        if (!caseRequest) {
          throw new NotFoundException('Solicitação de caso não encontrada');
        }

        if (caseRequest.lawyer_id !== userId) {
          throw new UnauthorizedException(
            'Você não tem permissão para aceitar esta solicitação',
          );
        }

        if (caseRequest.status !== 'Pending') {
          throw new BadRequestException(
            `Não é possível aceitar uma solicitação com status ${caseRequest.status}`,
          );
        }

        const acceptedRequest = await prisma.caseRequest.findFirst({
          where: {
            case_id: caseRequest.case_id,
            status: 'Accepted',
          },
        });

        if (acceptedRequest) {
          throw new BadRequestException(
            'Este caso já foi aceito por outro advogado',
          );
        }

        await prisma.caseRequest.update({
          where: { id: caseRequestId },
          data: { status: 'Accepted' },
        });

        const updatedCase = await prisma.case.update({
          where: { id: caseRequest.case_id },
          data: {
            status: 'Accepted',
            lawyer_id: userId,
          },
        });

        const updatedReport = await prisma.report.updateMany({
          where: { caseId: caseRequest.case_id },
          data: { lawyer_id: userId },
        });

        if (updatedReport.count === 0) {
          throw new NotFoundException('Relatório do caso não encontrado');
        }

        return { updatedCase, caseRequest };
      });

      await this.notificationsService.createNotification({
        target: { role: 'Citizen', userId: updatedCase.citizen_id },
        title: 'Solicitação de caso aceita',
        body: `Sua solicitação para o caso "${caseRequest.case.title}" foi aceita.`,
        type: NotificationType.CaseUpdate,
        metadata: {
          caseId: updatedCase.id,
          caseRequestId,
          lawyerId: userId,
        },
      });

      return {
        message: 'Caso aceito com sucesso',
        caseId: updatedCase.id,
        caseRequestId,
      };
    }

    throw new BadRequestException('Role inválida');
  }
}
