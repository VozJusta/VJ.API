import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLawyerDTO } from './create-lawyer.dto';

@Injectable()
export class LawyerService {
    constructor(private prisma: PrismaService) {}

    async create(body: CreateLawyerDTO) {
        
    }
}
