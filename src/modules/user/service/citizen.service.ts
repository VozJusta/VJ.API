import { BadRequestException, ConflictException, Injectable, NotAcceptableException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import { hash } from 'bcryptjs';
import { HashingServiceProtocol } from 'src/modules/auth/hash/hashing.service';
import { CpfNumberValidation } from 'src/modules/validation/service/cpf-number-validation.service';
import { CnpjNumberValidation } from 'src/modules/validation/service/cnpj-number-validation.service';

@Injectable()
export class CitizenService {
    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol,
        private readonly validateCPF: CpfNumberValidation,
        private readonly validateCnpj: CnpjNumberValidation,
    ) { }

    async create(body: CreateUserDTO) {

        const existingCitizen = await this.prisma.citizen.findFirst({
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

        if (existingCitizen) {
            throw new ConflictException('Cidadão já cadastrado')
        }

        const cpfValid = await this.validateCPF.validate(body.cpf)

        if(body.cnpj) {
            const cnpjValid = await this.validateCnpj.validate(body.cnpj)
        }

        if (!cpfValid) {
            throw new NotAcceptableException('CPF inválido')
        }

        const hashedPassword = await this.hashingService.hash(body.password)

        const newUser = await this.prisma.citizen.create({
            data: {
                full_name: body.fullName,
                cpf: body.cpf,
                cnpj: body.cnpj,
                phone: body.phone,
                email: body.email,
                password: hashedPassword
            },
            select: {
                id: true,
                full_name: true,
                cpf: true,
                cnpj: true,
                phone: true,
                email: true
            }
        })

        return {
            validated: true,
            sub: newUser.id,
            role: 'Citizen',
            email: newUser.email,
            full_name: newUser.full_name,
            loggedWithGoogle: false
        }
    }
}
