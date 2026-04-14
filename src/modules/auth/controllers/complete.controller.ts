import { Put, Body, Headers, Controller } from '@nestjs/common';
import { CompleteCitizenRegisterDTO } from '@m/auth/dto/complete-citizen-register.dto';
import { CompleteLawyerRegisterDTO } from '@m/auth/dto/complete-lawyer-register.dto';
import { CititzenInformationService } from '@m/auth/service/citizenInformation.service';
import { LawyerInformationService } from '@m/auth/service/lawyerInformation.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('complete')
export class CompleteController {
  constructor(
    private authCitizenService: CititzenInformationService,
    private authLawyerService: LawyerInformationService,
  ) {}
  @Put('citizen')
  async completeCitizenInformation(
    @Body() body: CompleteCitizenRegisterDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.authCitizenService.completeCitizenInformation(
      body,
      token,
    );
  }
  @Put('lawyer')
  async completeLawyerInformation(
    @Body() body: CompleteLawyerRegisterDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.authLawyerService.completeLawyerInformation(body, token);
  }
}
