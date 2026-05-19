import { HttpModule} from '@nestjs/axios'
import { Global, Module } from '@nestjs/common';
import { OabNumberValidationService } from '@m/validation/service/oab-number-validation.service';
import { CpfNumberValidation } from '@m/validation/service/cpf-number-validation.service';
import { CnpjNumberValidation } from '@m/validation/service/cnpj-number-validation.service';
import { EmailValidationService } from '@m/validation/service/email-validation.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    OabNumberValidationService,
    CpfNumberValidation,
    CnpjNumberValidation,
    EmailValidationService,
  ],
  exports: [
    OabNumberValidationService,
    CpfNumberValidation,
    CnpjNumberValidation,
    EmailValidationService,
  ]
})
export class ValidationModule {}
