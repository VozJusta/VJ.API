import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { hash } from 'bcryptjs';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol
    ) { }

    async create(body: CreateUserDTO) {

        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        cpf: body.cpf,
                    },
                    {
                        phone: body.phone
                    },
                    {
                        email: body.email
                    }
                ]
            }
        })

        if (existingUser) {
            throw new ConflictException('Usuario já cadastrado')
        }

        const hashedPassword = await this.hashingService.hash(body.password)

        const newUser = await this.prisma.user.create({
            data: {
                full_name: body.fullName,
                cpf: body.cpf,
                phone: body.phone,
                email: body.email,
                password: hashedPassword
            },
            select: {
                full_name: true,
                cpf: true,
                cnpj: true,
                phone: true,
                email: true
            }
        })

        return newUser

    }
}
