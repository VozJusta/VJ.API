import { Module } from '@nestjs/common';
import { AuthModule } from '@m/auth/module/auth.module';
import { PrismaModule } from '@m/prisma/prisma.module';
import { NotificationsGateway } from '@m/notifications/gateway/notifications.gateway';
import { NotificationsService } from '@m/notifications/service/notifications.service';
import { ListAllNotificationsService } from '@m/notifications/service/listNotifications.service';
import { GetAllNotificationsController } from '@m/notifications/controllers/getAllNotifications.controller';
import { ReadOneNotificationsService } from '@m/notifications/service/readOneNotifications.service';
import { PatchReadOneNotificationsController } from '@m/notifications/controllers/patchReadOneNotifications.controller';
import { PatchReadAllNotificationsController } from '@m/notifications/controllers/patchReadAllNotifications.controller';
import { ReadAllNotificationsService } from '@m/notifications/service/readAllNotifications.service';
import { DeleteNotificationsByIdController } from '@modules/notifications/controllers/deleteOneNotifications.controller';
import { DeleteNotificationsByIdService } from '@modules/notifications/service/deleteOneNotifications.service';
import { DeleteAllNotificationsService } from '@m/notifications/service/deleteAllNotifications.service';
import { DeleteAllNotificationsController } from '@m/notifications/controllers/deleteAllNotifications.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [
    NotificationsGateway,
    NotificationsService,
    ListAllNotificationsService,
    ReadOneNotificationsService,
    ReadAllNotificationsService,
    DeleteNotificationsByIdService,
    DeleteAllNotificationsService,
  ],
  controllers: [
    GetAllNotificationsController,
    PatchReadOneNotificationsController,
    PatchReadAllNotificationsController,
    DeleteNotificationsByIdController,
    DeleteAllNotificationsController,
  ],
  exports: [
    NotificationsGateway,
    NotificationsService,
    ReadOneNotificationsService,
    ListAllNotificationsService,
    ReadAllNotificationsService,
    DeleteNotificationsByIdService,
    DeleteAllNotificationsService,
  ],
})
export class NotificationsModule {}
