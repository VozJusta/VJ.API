import { PrismaService } from "@modules/prisma/service/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

interface tokenTypes {
    sub: string;
    role: 'Citizen' | 'Lawyer';
    email: string;
    fullName: string;
}

@Injectable()
export class GetUserDataService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) { }
    async getUserData(token: string) {
        try {
            const payload = this.jwtService.verify<tokenTypes>(token);
            const { sub, role } = payload;
            if (role === 'Citizen') {
                const user = await this.prisma.citizen.findUnique({
                    where: { id: sub },
                    select: {
                        id: true,
                        full_name: true,
                        subscription: {
                            where: {
                                user_id: sub,
                            },
                            select: {
                                plan: {
                                    select: {
                                        type: true,
                                    },
                                },
                            },
                        },
                    },
                });

                return user;
            } else {
                const user = await this.prisma.lawyer.findUnique({
                    where: { id: sub },
                    select: {
                        id: true,
                        full_name: true,
                        avatar_image: true,
                        subscription: {
                            where: {
                                lawyer_id: sub,
                            },
                            select: {
                                plan: {
                                    select: {
                                        type: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return user;
            }
        } catch (err) {
            throw new BadRequestException('Token inválido');
        }
    }
}