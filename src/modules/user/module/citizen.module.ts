import { Module } from '@nestjs/common';
import { CitizenService } from '../service/citizen.service';
import { CitizenController } from '../controllers/citizen.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AuthTokenGuard } from '../../auth/guard/access-token.guard';
import { AuthModule } from '../../auth/module/auth.module';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [CitizenService, AuthTokenGuard],
  controllers: [CitizenController],
})
export class CitizenModule {}
