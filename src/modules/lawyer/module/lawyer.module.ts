import { Module } from '@nestjs/common';
import { LawyerService } from '@m/lawyer/service/lawyer.service';
import { LawyerController } from '@m/lawyer/controllers/lawyer.controller';
import { PrismaModule } from '@m/prisma/prisma.module';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';
import { AuthModule } from '@m/auth/module/auth.module';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [LawyerService, SecurityTokenInterceptor],
  controllers: [LawyerController],
})
export class LawyerModule {}
