import { Module } from '@nestjs/common';
import { CitizenService } from '@m/user/service/citizen.service';
import { CitizenController } from '@m/user/controllers/citizen.controller';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthModule } from '@m/auth/module/auth.module'; 

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [CitizenService],
  controllers: [CitizenController],
})
export class CitizenModule {}
