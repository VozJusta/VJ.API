import { HttpModule} from '@nestjs/axios'
import { Global, Module } from '@nestjs/common';
import { OabNumberValidationService } from './oab-number-validation.service';
import { CpfNumberValidation } from './cpf-number-validation.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    OabNumberValidationService,
    CpfNumberValidation,
  ],
  exports: [
    OabNumberValidationService,
    CpfNumberValidation,
  ]
})
export class ValidationModule {}
