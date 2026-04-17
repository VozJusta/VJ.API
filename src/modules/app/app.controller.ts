import { Controller, Get } from '@nestjs/common';


@Controller()
export class AppController {
  constructor() {} 

  @Get()
  get() {
    return {
      status: 'Ok'
    }
  }
}
