import { Module } from '@nestjs/common';
import { AuthModule } from '@m/auth/module/auth.module';
import { PrismaModule } from '@m/prisma/prisma.module';
import { NotificationsGateway } from '@m/notifications/gateway/notifications.gateway';
import { NotificationsService } from '../service/notifications.service';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [NotificationsGateway, NotificationsService],
  controllers: [],
  exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
