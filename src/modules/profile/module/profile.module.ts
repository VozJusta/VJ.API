import { Module } from '@nestjs/common';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthModule } from '@m/auth/module/auth.module';
import { ShowProfile } from '../service/showProfile.service';
import { GetProfile } from '../controllers/getProfile.controller';
@Module({
  imports: [AuthModule, PrismaModule],
  providers: [ShowProfile],
  controllers: [GetProfile],
})
export class ProfileModule {}
