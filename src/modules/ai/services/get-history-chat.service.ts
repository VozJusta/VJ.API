import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class GetHistoryChatService {
    constructor(
        private prisma: PrismaService
    ) {}

    async getHistoryChat(id: string) {
            const conversation = await this.prisma.conversation.findUnique({
                where: {
                    id: id,
                },
                include: {
                    messages: true
                },
            })
    
            if (!conversation) {
                throw new NotFoundException('Conversa não encontrada')
            }
    
            return {
                messages: conversation.messages
            }
        }
}