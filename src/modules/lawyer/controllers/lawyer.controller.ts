import { Body, Controller, Post } from '@nestjs/common';
import { LawyerService } from '../service/lawyer.service';
import { CreateLawyerDTO } from '../dto/create-lawyer.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('lawyer')
export class LawyerController {
    constructor(private readonly lawyerService: LawyerService) {}

    @Post()
    @ApiBody({
        description: 'Criação de advogado',
        required: true,
        schema: {
            example: {
                fullName: 'Thiago Menezes',
                cpf: '123.456.789-00',
                oabNumber: '123456',
                oabState: 'SP',
                specialization: 'Tax',
                phone: '11 99999-9999',
                email: 'thiago@gmail.com',
                password: '@Za12345678'
            }
        }
    })
    @ApiResponse({
        description: 'Resposta de sucesso da criação de advogado',
        status: 201,
        schema: {
            example: {
                full_name: 'Thiago Menezes',
                cpf: '123.456.789-00',
                oab_number: '123456',
                oab_state: 'SP',
                specialization: 'Tax',
                phone: '11 99999-9999',
                email: 'thiago@gmail.com',
                lawyer_status: 'Verified'
            }
        }
    })
    async createLawyer(@Body() body: CreateLawyerDTO) {
        return await this.lawyerService.create(body)
    }
}
