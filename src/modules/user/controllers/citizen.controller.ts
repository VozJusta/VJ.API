import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { CitizenService } from '@m/user/service/citizen.service';
import { CreateUserDTO } from '@m/user/dto/create-user.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';

@Controller('citizen')
export class CitizenController {
    constructor(private readonly citizenService: CitizenService) {}

    @Post()
    @UseInterceptors(SecurityTokenInterceptor)
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
        description: 'Retorno da criação do usuário',
        status: 201,
        schema: {
            example: {
                validate: true,
                sub: '47ff0575-8976-4316-877d-936a2b1d478c',
                role: 'Citizen',
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
    async createCitizen(@Body() body: CreateUserDTO) {
        return await this.citizenService.create(body)
    }
}
