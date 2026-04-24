import { Module } from '@nestjs/common';
import { CitizenService } from '@modules/citizen/service/citizen.service';
import { CitizenController } from '@modules/citizen/controllers/citizen.controller';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthModule } from '@m/auth/module/auth.module'; 
import { GetLawyersForCitizen } from '@m/citizen/controllers/getLawyersForCitizen.controller';
import { ListLawyersForCitizens } from '@m/citizen/service/listLawyersForCitizens.service';
import { FindLawyerForCitizen } from '../service/findLawyerForCitizen.service';
import { GetOneLawyerForCitizen } from '../controllers/getOneLawyerForCitizen.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [CitizenService, ListLawyersForCitizens, FindLawyerForCitizen],
  controllers: [CitizenController, GetLawyersForCitizen, GetOneLawyerForCitizen],
})
export class CitizenModule {}
