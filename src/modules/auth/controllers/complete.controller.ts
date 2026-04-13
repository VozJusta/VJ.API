import { Put, Body, Headers, Controller } from '@nestjs/common';
import { CompleteCitizenRegisterDTO } from '../dto/complete-citizen-register.dto';
import { CompleteLawyerRegisterDTO } from '../dto/complete-lawyer-register.dto';
import { CititzenInformationService } from '../service/citizenInformation.service';
import { LawyerInformationService } from '../service/lawyerInformation.service';

@Controller('complete')
export class CompleteController {
  constructor(
    private authCitizenService: CititzenInformationService,
    private authLawyerService: LawyerInformationService
  ) { }
  @Put('citizen')
  async completeCitizenInformation(
    @Body() body: CompleteCitizenRegisterDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.authCitizenService.completeCitizenInformation(body, token);
  }

  @Put('lawyer')
  async completeLawyerInformation(
    @Body() body: CompleteLawyerRegisterDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.authLawyerService.completeLawyerInformation(body, token);
  }
}
