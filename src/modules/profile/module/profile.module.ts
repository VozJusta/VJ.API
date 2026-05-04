import { Module } from '@nestjs/common';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthModule } from '@m/auth/module/auth.module';
@Module({
  imports: [AuthModule, PrismaModule],
  providers: [],
  controllers: [],
})
export class ProfileModule {}
