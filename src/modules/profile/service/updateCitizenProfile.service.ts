import { PrismaService } from '@modules/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateCitizenDTO } from '@m/profile/dto/update-citizen.dto';
import { UpdateLawyerDTO } from '@m/profile/dto/update-lawyer.dto';

@Injectable()
export class UpdateCitizenProfile {
  constructor(private readonly prisma: PrismaService) {}

  async updateCitizen(userId: string, role: string, update: UpdateCitizenDTO) {

  }
}
