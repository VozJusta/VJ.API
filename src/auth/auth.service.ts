import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import { SignInDTO } from './dto/signIn.dto';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol,

        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtService: JwtService
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

        const token = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                name: user.full_name
            },
            {
                secret: this.jwtConfiguration.secret,
                expiresIn: this.jwtConfiguration.jwtTtl as any,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer
            }
        )

        return {
            access_token: token
        }
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
