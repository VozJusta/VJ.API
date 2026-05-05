import { Module } from '@nestjs/common';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthModule } from '@m/auth/module/auth.module';
import { ShowProfileService } from '@m/profile/service/showProfile.service';
import { GetProfileController } from '@m/profile/controllers/getProfile.controller';
import { UpdateCitizenProfileService } from '../service/updateCitizenProfile.service';
import { PutUpdateProfile } from '../controllers/putUpdateProfile.controller';
import { UpdateLawyerProfileService } from '../service/updateLawyerProfile.service';
@Module({
  imports: [AuthModule, PrismaModule],
  providers: [ShowProfileService, UpdateCitizenProfileService, UpdateLawyerProfileService],
  controllers: [GetProfileController, PutUpdateProfile],
})
export class ProfileModule {}
