import { Module } from '@nestjs/common';
import { LawyerService } from '../lawyer/service/lawyer.service';
import { LawyerController } from '../lawyer/controllers/lawyer.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LawyerService],
  controllers: [LawyerController]
})
export class LawyerModule {}
