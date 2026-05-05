import { Body, Controller, Put, Req, UseGuards } from '@nestjs/common';
import { UpdateCitizenProfileService } from '@m/profile/service/updateCitizenProfile.service';
import { UpdateLawyerProfileService } from '@m/profile/service/updateLawyerProfile.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';

@Controller('profile')
export class PutUpdateProfile {
  constructor(
    private readonly updateCitizen: UpdateCitizenProfileService,
    private readonly updateLawyer: UpdateLawyerProfileService,
  ) {}

  @Put()
  @UseGuards(AuthTokenGuardAccess)
  async putUpdateProfile(@Req() req: RequestUser, @Body() body: any) {
    const userId = req.user.sub;
    const role = req.user.role;

    if (role === 'Citizen') {
      return this.updateCitizen.updateCitizen(userId, role, body);
    } else if (role === 'Lawyer') {
      return this.updateLawyer.updateLawyer(userId, role, body);
    }
  }
}
