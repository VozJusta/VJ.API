import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  Controller,
  Get,
  Headers,
  HttpCode,
} from '@nestjs/common';

import { GetUserDataService } from '../service/getUserData.service';

@Controller()
export class userDataController {
  constructor(
    private readonly getUserDataService: GetUserDataService
  ) {} 
  @Get('/me')
  @HttpCode(200)
  async getUserData(@Headers('token') token: string) {
  return await this.getUserDataService.getUserData(token);
  }
}
