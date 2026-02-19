import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLawyerDTO } from './dto/create-lawyer.dto';
import { hash, hashSync } from 'bcryptjs';
import { OabNumberValidationService } from 'src/validation/oab-number-validation.service';
import { ValidateLawyerDTO } from './dto/validate-lawyer.dto';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';

@Injectable()
export class LawyerService {
    constructor(
        private prisma: PrismaService,
        private readonly validateOab: OabNumberValidationService,
        private readonly hashingService: HashingServiceProtocol
    ) { }

    async create(body: CreateLawyerDTO) {

        const existingLawyer = await this.prisma.lawyer.findFirst({
            where: {
                OR: [
                    { cpf: body.cpf },
                    {
                        oab_number: body.oabNumber,
                        oab_state: body.oabState
                    },
                    { phone: body.phone },
                    { email: body.email }
                ]
            }
        })

        if (existingLawyer) {
            throw new ConflictException('Usuário já cadastrado')
        }

        const hashedPassword = await this.hashingService.hash(body.password)

        const validationOabDTO: ValidateLawyerDTO = {
            nomeAdvo: body.fullName,
            insc: body.oabNumber,
            uf: body.oabState
        }

        const validateLawyer = await this.validateOab.validate(validationOabDTO)
        
        if(validateLawyer['Data'].length === 0) {
            throw new NotFoundException('Advogado não encontrado no banco de dados da OAB')
        }

        const newLawyer = await this.prisma.lawyer.create({
            data: {
                full_name: body.fullName,
                cpf: body.cpf,
                oab_number: body.oabNumber,
                oab_state: body.oabState,
                specialization: body.specialization,
                phone: body.phone,
                email: body.email,
                password: hashedPassword,
                lawyer_status: 'Verified'
            }
        })

        return newLawyer

    }
}
