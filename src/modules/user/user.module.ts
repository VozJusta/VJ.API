import { Module } from '@nestjs/common';
import { UserService } from '../user/service/user.service';
import { UserController } from '../user/controllers/user.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
