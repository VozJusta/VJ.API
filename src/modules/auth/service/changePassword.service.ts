import { NotFoundException, UnauthorizedException, ConflictException, Injectable } from "@nestjs/common"
import { PrismaService } from "src/modules/prisma/service/prisma.service"
import { ChangePasswordDTO } from "../dto/change-password.dto"
import { HashingServiceProtocol } from "../hash/hashing.service"

@Injectable()
export class ChangePasswordService {
    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol,
    ) { }
    async changePassword(body: ChangePasswordDTO, userId: string) {
        const citizen = await this.prisma.citizen.findFirst({
            where: { id: userId }
        })

        const lawyer = !citizen ? await this.prisma.lawyer.findFirst({
            where: { id: userId }
        }) : null

        const user = citizen || lawyer
        const userType = citizen ? 'citizen' : 'lawyer'

        if (!user) {
            throw new NotFoundException('Usuário não encontrado')
        }

        const wrongPassword = await this.hashingService.compare(body.currentPassword, user.password || '')

        if (!wrongPassword) {
            throw new UnauthorizedException('Senha incorreta')
        }

        const samePassword = await this.hashingService.compare(body.newPassword, user.password || '')

        if (samePassword) {
            throw new ConflictException('Senha não pode ser igual a anterior')
        }

        const hashedPassword = await this.hashingService.hash(body.newPassword)

        if (userType === 'citizen') {
            await this.prisma.citizen.update({
                where: { id: userId },
                data: { password: hashedPassword }
            })
        } else {
            await this.prisma.lawyer.update({
                where: { id: userId },
                data: { password: hashedPassword }
            })
        }

        return {
            message: 'Senha atualizada com sucesso'
        }
    }



}