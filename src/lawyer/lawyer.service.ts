import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLawyerDTO } from './create-lawyer.dto';
import { hash, hashSync } from 'bcryptjs';

@Injectable()
export class LawyerService {
    constructor(private prisma: PrismaService) {}

    async create(body: CreateLawyerDTO) {
        try {
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

            if(existingLawyer) {
                throw new ConflictException('Usuário já cadastrado')
            }

            const hashedPassword = await hash(body.password, 12)

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
                    lawyer_status: 'Pending'
                }
            })

            return newLawyer
        } catch(err) {
            return { message: err}
        }
    }
}
