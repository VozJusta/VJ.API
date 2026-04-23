import { Module } from '@nestjs/common';
import { CitizenService } from '@modules/citizen/service/citizen.service';
import { CitizenController } from '@modules/citizen/controllers/citizen.controller';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthModule } from '@m/auth/module/auth.module'; 

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [CitizenService],
  controllers: [CitizenController],
})
export class CitizenModule {}
