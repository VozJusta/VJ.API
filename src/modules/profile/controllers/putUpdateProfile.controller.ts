import { Body, Controller, ForbiddenException, Put, Req, UseGuards } from '@nestjs/common';
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
    const role = req.user.role?.toLowerCase?.() ?? '';

    if (role === 'citizen') {
      return this.updateCitizen.updateCitizen(userId, role, body);
    }

    if (role === 'lawyer') {
      return this.updateLawyer.updateLawyer(userId, role, body);
    }

    throw new ForbiddenException('Role não autorizada para atualizar o perfil');
  }
}
