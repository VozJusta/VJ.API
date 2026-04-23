import { PrismaService } from '@modules/prisma/service/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ListLawyersForCitizens {
  constructor(private readonly prisma: PrismaService) {}

  
}
