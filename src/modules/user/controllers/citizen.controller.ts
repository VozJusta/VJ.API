import { Body, Controller, Get, Post } from '@nestjs/common';
import { CitizenService } from '../service/citizen.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('citizen')
export class CitizenController {
    constructor(private readonly citizenService: CitizenService) {}

    @Post()
    @ApiBody({
        description: 'Criação do usuário',
        required: true,
        schema: {
            example: {
                fullName: 'Pedro Sales',
                cpf: '123.456.789-00',
                phone: '11 99999-9999',
                email: 'pedro@gmail.com',
                password: '@Za12345678'
            }
        }
    })
    @ApiResponse({
        description: 'Resposta de sucesso da criação de usuário',
        status: 201,
        schema: {
            example: {
                full_name: 'Pedro Sales',
                cpf: '123.456.789-00',
                cnpj: 'null',
                phone: '11 99999-9999',
                email: 'pedro@gmail.com',
            }
        }
    })
    async createCitizen(@Body() body: CreateUserDTO) {
        return await this.citizenService.create(body)
    }
}
