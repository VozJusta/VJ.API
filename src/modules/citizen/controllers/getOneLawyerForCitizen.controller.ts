import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FindLawyerForCitizen } from '../service/findLawyerForCitizen.service';
import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';

@Controller('lawyers')
export class GetOneLawyerForCitizen {
  constructor(private readonly findLawyer: FindLawyerForCitizen) {}

  @Get('/:lawyerId')
  @UseGuards(AuthTokenGuard)
  async getOneLawyer(
    @Req() req: RequestUser,
    @Param('lawyerId') lawyerId: string,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.findLawyer.findLawyerForCitizen(userId, role, lawyerId);
  }
}
