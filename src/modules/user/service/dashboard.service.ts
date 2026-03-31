import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';

const DASHBOARD_FIELDS = {
  lawyer: {
    id: true,
    full_name: true,
    email: true,
    phone: true,
    cpf: true,
    bio: true,
    avatar_image: true,
    specialization: true,
    lawyer_status: true,
    report: true,
    created_at: true,
  },
  citizen: {
    id: true,
    full_name: true,
    email: true,
    phone: true,
    cpf: true,
    cnpj: true,
    report: true,
    created_at: true,
  },
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUserId(userId: string, role: string) {
    
  }
}
