import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import { SignInDTO } from './dto/signIn.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol
    ) {}

    async authenticateUser(body: SignInDTO) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: body.email
            }
        })

        if(!user) {
            throw new UnauthorizedException('Email/senha incorretos')
        }

        const passwordMatch = await this.hashingService.compare(body.password, user.password)

        if(!passwordMatch) {
            throw new UnauthorizedException('Email/senha incorretos')
        }

        return 'Usuario logado'
    }

    async authenticateLawyer(body: SignInDTO) {
        const lawyer = await this.prisma.lawyer.findFirst({
            where: {
                email: body.email
            }
        })

        if(!lawyer) {
            throw new UnauthorizedException('Email/senha inválidos')
        }

        const passwordMatch = await this.hashingService.compare(body.password, lawyer.password)

        if(!passwordMatch) {
            throw new UnauthorizedException('Email/senha inválidos')
        }

        return {
            name: lawyer.full_name,
            spec: lawyer.specialization
        }
    }
}
