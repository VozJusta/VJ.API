import { Module } from '@nestjs/common';
import { CitizenService } from '@modules/citizen/service/citizen.service';
import { CitizenController } from '@modules/citizen/controllers/citizen.controller';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthModule } from '@m/auth/module/auth.module';
import { NotificationsModule } from '@m/notifications/module/notifications.module';
import { CreateEvidenceController } from '../controllers/createEvidence.controller';

@Module({
  imports: [AuthModule, PrismaModule, NotificationsModule],
  providers: [
    CitizenService,

  ],
  controllers: [
    CitizenController,
    CreateEvidenceController,
  ],
})
export class CitizenModule {}
