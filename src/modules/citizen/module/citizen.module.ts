import { Module } from '@nestjs/common';
import { CitizenService } from '@modules/citizen/service/citizen.service';
import { CitizenController } from '@modules/citizen/controllers/citizen.controller';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthModule } from '@m/auth/module/auth.module';
import { NotificationsModule } from '@m/notifications/module/notifications.module';
import { CreateEvidenceController } from '../controllers/createEvidence.controller';
import { GetLawyersForCitizen } from '../controllers/getLawyersForCitizen.controller';
import { GetOneLawyerForCitizen } from '../controllers/getOneLawyerForCitizen.controller';
import { PostCaseRequestController } from '../controllers/postCaseRequest.controller';
import { CreateCaseRequest } from '../service/createCaseRequest.service';
import { FindLawyerForCitizen } from '../service/findLawyerForCitizen.service';
import { ListLawyersForCitizens } from '../service/listLawyersForCitizens.service';
import { CreateEvidenceService } from '../service/createEvidence.service';
import { CloudinaryService } from '../service/cloudinary.service';


@Module({
  imports: [AuthModule, PrismaModule, NotificationsModule],
  providers: [
    CitizenService,
    ListLawyersForCitizens,
    FindLawyerForCitizen,
    CreateCaseRequest,
    CreateEvidenceService,
    CloudinaryService,
  ],
  controllers: [
    CitizenController,
    CreateEvidenceController,
    GetLawyersForCitizen,
    GetOneLawyerForCitizen,
    PostCaseRequestController,
  ],
})
export class CitizenModule { }