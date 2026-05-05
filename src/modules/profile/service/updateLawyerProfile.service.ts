import { PrismaService } from '@modules/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateLawyerDTO } from '../dto/update-lawyer.dto';

@Injectable()
export class UpdateLawyerProfile {
  constructor(private readonly prisma: PrismaService) {}

  async updateLawyer(userId: string, role: string, update: UpdateLawyerDTO) {
    
  }
}
