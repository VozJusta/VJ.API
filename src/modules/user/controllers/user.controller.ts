import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

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
    async createUser(@Body() body: CreateUserDTO) {
        return await this.userService.create(body)
    }
}
