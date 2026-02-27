import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from 'src/user/user.module';
import { LawyerModule } from 'src/lawyer/lawyer.module';
import { ValidationModule } from 'src/validation/validation.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config'
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    LawyerModule,
    ValidationModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
