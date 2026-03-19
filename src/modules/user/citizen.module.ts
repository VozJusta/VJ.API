import { Module } from '@nestjs/common';
import { CitizenService } from './service/citizen.service';
import { CitizenController } from './controllers/citizen.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CitizenService],
  controllers: [CitizenController]
})
export class CitizenModule {}
