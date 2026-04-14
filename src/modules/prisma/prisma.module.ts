import { Module } from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
