import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from 'src/user/user.module';
import { LawyerModule } from 'src/lawyer/lawyer.module';
import { ValidationModule } from 'src/validation/validation.module';

@Module({
  imports: [
    UserModule,
    LawyerModule,
    ValidationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
