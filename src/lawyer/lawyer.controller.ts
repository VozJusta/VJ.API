import { Body, Controller, Post } from '@nestjs/common';
import { LawyerService } from './lawyer.service';
import { CreateLawyerDTO } from './dto/create-lawyer.dto';

@Controller('lawyer')
export class LawyerController {
    constructor(private readonly lawyerService: LawyerService) {}

    @Post()
    async createLawyer(@Body() body: CreateLawyerDTO) {
        return await this.lawyerService.create(body)
    }
}
