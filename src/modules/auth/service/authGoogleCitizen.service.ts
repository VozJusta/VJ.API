import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/modules/prisma/service/prisma.service"


@Injectable()
export class AuthenticateGoogleCitizenService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async authenticateGoogleCitizen(email: string, name: string) {
        let citizen = await this.prisma.citizen.findFirst({
            where: {
                email: email
            }
        })

        if (!citizen) {
            citizen = await this.prisma.citizen.create({
                data: {
                    email: email,
                    full_name: name,
                }
            })

            return {
                validated: true,
                sub: citizen.id,
                role: 'Citizen',
                email: citizen.email,
                full_name: citizen.full_name,
                loggedWithGoogle: true,
                registerCompleted: false
            }
        }

        return {
            validated: true,
            sub: citizen.id,
            role: 'Citizen',
            email: citizen.email,
            full_name: citizen.full_name,
            loggedWithGoogle: true,
            registerCompleted: true
        }
    }

}