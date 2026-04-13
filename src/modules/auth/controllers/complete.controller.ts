import { Put, Body, Headers, Controller } from '@nestjs/common';
import { CompleteCitizenRegisterDTO } from '../dto/complete-citizen-register.dto';
import { CompleteLawyerRegisterDTO } from '../dto/complete-lawyer-register.dto';
import { AuthService } from '../service/auth.service';

@Controller('complete')
export class CompleteController {
  constructor(private authService: AuthService) {}
  @Put('citizen')
  async completeCitizenInformation(
    @Body() body: CompleteCitizenRegisterDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.authService.completeCitizenInformation(body, token);
  }

  @Put('lawyer')
  async completeLawyerInformation(
    @Body() body: CompleteLawyerRegisterDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.authService.completeLawyerInformation(body, token);
  }
}
