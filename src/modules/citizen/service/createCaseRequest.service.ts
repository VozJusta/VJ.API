import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from '../../notifications/service/notifications.service';
import { NotificationType } from 'generated/prisma/client';

@Injectable()
export class CreateCaseRequest {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createCaseRequest(
    userId: string,
    role: string,
    lawyerId: string,
    caseId: string,
  ) {
    const userRole = role.toLowerCase();

    if (userRole !== 'citizen') {
      throw new BadRequestException('Role inválida');
    }

    const citizen = await this.prisma.citizen.findFirst({
      where: { id: userId },
      select: { id: true },
    });

    if (!citizen) {
      throw new NotFoundException('Cidadão não encontrado');
    }

    const lawyer = await this.prisma.lawyer.findFirst({
      where: { id: lawyerId },
      select: { id: true },
    });

    if (!lawyer) {
      throw new NotFoundException('Advogado não encontrado');
    }

    const legalCase = await this.prisma.case.findFirst({
      where: {
        id: caseId,
        citizen_id: userId,
      },
      select: { id: true, title: true },
    });

    if (!legalCase) {
      throw new NotFoundException('Caso não encontrado');
    }

    const existingRequest = await this.prisma.caseRequest.findFirst({
      where: {
        case_id: caseId,
        lawyer_id: lawyerId,
      },
      select: { id: true },
    });

    if (existingRequest) {
      throw new ConflictException(
        'Já existe uma solicitação para este advogado neste caso',
      );
    }

    const createdCaseRequest = await this.prisma.caseRequest.create({
      data: {
        case_id: caseId,
        citizen_id: userId,
        lawyer_id: lawyerId,
        status: 'Pending',
      },
      select: {
        id: true,
        case_id: true,
        citizen_id: true,
        lawyer_id: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    await this.notificationsService.createNotification({
      target: { role: 'Lawyer', userId: lawyerId },
      title: 'Nova solicitação de caso',
      body: `Você recebeu uma nova solicitação para o caso "${legalCase.title}".`,
      type: NotificationType.REQUEST_SENT,
      metadata: {
        caseId,
        caseRequestId: createdCaseRequest.id,
        citizenId: userId,
      },
    });

    return {
      message: 'Solicitação de caso enviada com sucesso',
      caseRequest: createdCaseRequest,
    };
  }
}
