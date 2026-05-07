import { Module } from '@nestjs/common';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthModule } from '@m/auth/module/auth.module';
import { ShowProfileService } from '@m/profile/service/showProfile.service';
import { GetProfileController } from '@m/profile/controllers/getProfile.controller';
import { UpdateCitizenProfileService } from '@m/profile/service/updateCitizenProfile.service';
import { PutUpdateProfile } from '@m/profile/controllers/putUpdateProfile.controller';
import { UpdateLawyerProfileService } from '@m/profile/service/updateLawyerProfile.service';
import { UploadImageProfileService } from '@m/profile/service/uploadImageProfile.service';
import { UploadProfileImageController } from '@m/profile/controllers/uploadProfileImage.controller';
import { ValidateUpdateProfilePipe } from '@m/profile/pipes/validate-update-profile.pipe';
@Module({
  imports: [AuthModule, PrismaModule],
  providers: [
    ShowProfileService,
    UpdateCitizenProfileService,
    UpdateLawyerProfileService,
    UploadImageProfileService,
    ValidateUpdateProfilePipe,
  ],
  controllers: [GetProfileController, PutUpdateProfile, UploadProfileImageController],
})
export class ProfileModule {}
