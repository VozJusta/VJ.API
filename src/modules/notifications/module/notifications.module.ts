import { Module } from '@nestjs/common';
import { AuthModule } from '@m/auth/module/auth.module';
import { PrismaModule } from '@m/prisma/prisma.module';
import { NotificationsGateway } from '@m/notifications/gateway/notifications.gateway';
import { NotificationsService } from '@m/notifications/service/notifications.service';
import { ReadAllNotifications } from '@m/notifications/service/listNotifications.service';
import { GetAllNotifications } from '@m/notifications/controllers/getAllNotifications.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [NotificationsGateway, NotificationsService, ReadAllNotifications],
  controllers: [GetAllNotifications],
  exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
