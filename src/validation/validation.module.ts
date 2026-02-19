import { HttpModule} from '@nestjs/axios'
import { Global, Module } from '@nestjs/common';
import { OabNumberValidationService } from './oab-number-validation.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [OabNumberValidationService],
  exports: [OabNumberValidationService]
})
export class ValidationModule {}
