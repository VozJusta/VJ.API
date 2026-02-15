import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { createConnection } from 'net';
import { hash } from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async create(body: CreateUserDTO) {
        try {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        {
                            cpf: body?.cpf,
                        },
                        {
                            phone: body?.phone
                        },
                        {
                            email: body?.email
                        }
                    ]
                }
            })

            if(existingUser) {
                throw new ConflictException('Usuario já cadastrado')
            }

            const hashedPassword = await hash(body.password, 12)
            
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
                    phone: true,
                    email: true
                }
            })

            return newUser
        } catch(err) {
            throw new BadRequestException(err)
        }
    }
}
