import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Param,
} from '@nestjs/common';
import { HashingServiceProtocol } from '../hash/hashing.service';
import { TerminateAccountService } from '../service/terminateAccount.service';

@Controller()
export class TerminateAccountController {
  constructor(private terminateAccountService: TerminateAccountService) {}
  @Delete('/terminate-account/:id')
  async terminateAccount(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return await this.terminateAccountService.terminateAccount(id, password);
  }
}
