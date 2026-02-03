import { Module } from '@nestjs/common';
import { LawyerService } from './lawyer.service';
import { LawyerController } from './lawyer.controller';

@Module({
  providers: [LawyerService],
  controllers: [LawyerController]
})
export class LawyerModule {}
