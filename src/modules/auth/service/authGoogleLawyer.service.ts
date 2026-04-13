import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/modules/prisma/service/prisma.service"

@Injectable()
export class AuthenticateGoogleLawyerService {
    constructor(
        private prisma: PrismaService,
    ) { }

     async authenticateGoogleLawyer(email: string, name: string) {
    
            let lawyer = await this.prisma.lawyer.findFirst({
                where: {
                    email: email
                }
            })
    
            if (!lawyer) {
                lawyer = await this.prisma.lawyer.create({
                    data: {
                        email: email,
                        full_name: name,
                    }
                })
    
                return {
                    validated: true,
                    sub: lawyer.id,
                    role: 'Lawyer',
                    email: lawyer.email,
                    full_name: lawyer.full_name,
                    loggedWithGoogle: true,
                    registerCompleted: false
                }
            }
    
            return {
                validated: true,
                sub: lawyer.id,
                role: 'Lawyer',
                email: lawyer.email,
                full_name: lawyer.full_name,
                loggedWithGoogle: true,
                registerCompleted: true
            }
        }
}