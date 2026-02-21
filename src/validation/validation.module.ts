import { HttpModule } from '@nestjs/axios';
import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OabNumberValidationService } from './oab-number-validation.service';
import { CpfNumberValidation } from './cpf-number-validation.service';

@Global()
@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    OabNumberValidationService,
    CpfNumberValidation,
  ],
  exports: [
    OabNumberValidationService,
    CpfNumberValidation,
  ]
})
export class ValidationModule implements OnModuleInit {
  private readonly logger = new Logger(ValidationModule.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const oabApiUrl = this.configService.get<string>('OAB_API_URL');
    const cpfApiUrl = this.configService.get<string>('CPF_API_URL');

    if (!oabApiUrl) {
      this.logger.warn('OAB_API_URL is not set. Falling back to default OAB API URL.');
    }
    if (!cpfApiUrl) {
      this.logger.warn('CPF_API_URL is not set. Falling back to default CPF API URL.');
    }
  }
}
