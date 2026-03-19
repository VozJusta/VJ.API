import { BadRequestException, ConflictException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';
import { CreateLawyerDTO } from '../dto/create-lawyer.dto';
import { hash, hashSync } from 'bcryptjs';
import { OabNumberValidationService } from 'src/modules/validation/service/oab-number-validation.service';
import { ValidateLawyerDTO } from '../dto/validate-lawyer.dto';
import { HashingServiceProtocol } from 'src/modules/auth/hash/hashing.service';
import { CpfNumberValidation } from 'src/modules/validation/service/cpf-number-validation.service';

@Injectable()
export class LawyerService {
    constructor(
        private prisma: PrismaService,
        private readonly validateOab: OabNumberValidationService,
        private readonly hashingService: HashingServiceProtocol,
        private readonly validateCPF: CpfNumberValidation
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
            throw new ConflictException('Advogado já cadastrado')
        }

        const hashedPassword = await this.hashingService.hash(body.password)

        const cpfValid = await this.validateCPF.validate(body.cpf)

        if(!cpfValid) {
            throw new NotAcceptableException('CPF inválido')
        }

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
            },
            select: {
                full_name: true,
                cpf: true,
                oab_number: true,
                oab_state: true,
                specialization: true,
                phone: true,
                email: true,
                lawyer_status: true
            }
        })

        return newLawyer

    }
}
