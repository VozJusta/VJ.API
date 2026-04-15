import { HttpModule} from '@nestjs/axios'
import { Global, Module } from '@nestjs/common';
import { OabNumberValidationService } from '@m/validation/service/oab-number-validation.service';
import { CpfNumberValidation } from '@m/validation/service/cpf-number-validation.service';
import { CnpjNumberValidation } from '@m/validation/service/cnpj-number-validation.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    OabNumberValidationService,
    CpfNumberValidation,
    CnpjNumberValidation,
  ],
  exports: [
    OabNumberValidationService,
    CpfNumberValidation,
    CnpjNumberValidation,
  ]
})
export class ValidationModule {}
