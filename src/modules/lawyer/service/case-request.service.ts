import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';

@Injectable()
export class CaseRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async acceptCaseRequest(caseRequestId: string, lawyerId: string) {
    const caseRequest = await this.prisma.caseRequest.findUnique({
      where: { id: caseRequestId },
      include: { case: true },
    });

    if (!caseRequest) {
      throw new NotFoundException('Solicitação de caso não encontrada');
    }

    if (caseRequest.lawyer_id !== lawyerId) {
      throw new UnauthorizedException(
        'Você não tem permissão para aceitar esta solicitação',
      );
    }

    if (caseRequest.status !== 'Pending') {
      throw new BadRequestException(
        `Não é possível aceitar uma solicitação com status ${caseRequest.status}`,
      );
    }

    const acceptedRequest = await this.prisma.caseRequest.findFirst({
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

    await this.prisma.caseRequest.update({
      where: { id: caseRequestId },
      data: { status: 'Accepted' },
    });

    const updatedCase = await this.prisma.case.update({
      where: { id: caseRequest.case_id },
      data: {
        status: 'Accepted',
        lawyer_id: lawyerId,
      },
    });

    return {
      message: 'Caso aceito com sucesso',
      caseId: updatedCase.id,
      caseRequestId,
    };
  }

  async rejectCaseRequest(caseRequestId: string, lawyerId: string) {
    const caseRequest = await this.prisma.caseRequest.findUnique({
      where: { id: caseRequestId },
      include: { case: true },
    });

    if (!caseRequest) {
      throw new NotFoundException('Solicitação de caso não encontrada');
    }

    if (caseRequest.lawyer_id !== lawyerId) {
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

    return {
      message: 'Solicitação de caso recusada com sucesso',
      caseRequestId,
    };
  }


  async getCaseRequestsBylawyer(lawyerId: string, status?: string) {
    const whereClause: any = {
      lawyer_id: lawyerId,
    };

    if (status) {
      whereClause.status = status;
    }

    const caseRequests = await this.prisma.caseRequest.findMany({
      where: whereClause,
      include: {
        case: {
          select: {
            id: true,
            title: true,
            status: true,
            user: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
            reports: {
              select: {
                id: true,
                category_detected: true,
              },
            },
          },
        },
        citizen: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return caseRequests;
  }


}