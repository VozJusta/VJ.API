import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { LawyerService } from '../service/lawyer.service';
import { CreateLawyerDTO } from '../dto/create-lawyer.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { SecurityTokenInterceptor } from 'src/modules/auth/interceptors/security-token.interceptor';

@Controller('lawyer')
export class LawyerController {
    constructor(private readonly lawyerService: LawyerService) {}

    @Post()
    @UseInterceptors(SecurityTokenInterceptor)
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
        description: 'Retorno da criação do lawyer',
        status: 201,
        schema: {
            example: {
                validate: true,
                sub: '47ff0575-8976-4316-877d-936a2b1d478c',
                role: 'Lawyer',
                email: 'pedro@gmail.com',
                full_name: 'Pedro Sales',
                loggedWithGoogle: false
            }
        },
        headers: {
            'x-security-token': {
                description: 'x-security-token para autenticação',
                schema: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    async createLawyer(@Body() body: CreateLawyerDTO) {
        return await this.lawyerService.create(body)
    }
}
