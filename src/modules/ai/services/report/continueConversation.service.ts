import { ContinueConversationDto } from "@modules/ai/dto/continue-conversation.dto";
import { PrismaService } from "@modules/prisma/service/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { LlmService } from "../llm.service";

@Injectable()
export class ContinueConversationService {
    constructor(
        private prisma: PrismaService, 
        private llmService: LlmService
    ) { }
    async continueConversation(continueConversation: ContinueConversationDto, userId: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: continueConversation.conversationId },
            include: { messages: { orderBy: { created_at: 'desc' } } }
        });

        if (!conversation) throw new NotFoundException('Conversa não encontrada');
        if (conversation.is_closed) throw new BadRequestException('Conversa já encerrada');

        await this.prisma.message.create({
            data: {
                conversation_id: continueConversation.conversationId,
                role: 'User',
                content: continueConversation.message,
            }
        });

        const allMessages = [
            ...conversation.messages,
            { role: 'User' as const, content: continueConversation.message }
        ];

        const userTurns = allMessages.filter(m => m.role === 'User').length;
        const forcedGenerate = userTurns >= MAX_TURNS;

        if (forcedGenerate) {
            return this.generateReportFromConversation(continueConversation.conversationId, conversation.case_id, userId);
        }

        const { shouldGenerate, questionOrAck } = await this.llmService.chat(
            allMessages.map(m => ({ role: m.role as 'User' | 'Assistant', content: m.content }))
        );

        await this.prisma.message.create({
            data: {
                conversation_id: continueConversation.conversationId,
                role: 'Assistant',
                content: questionOrAck,
            }
        });

        if (shouldGenerate) {
            return this.generateReportFromConversation(continueConversation.conversationId, conversation.case_id, userId);
        }

        return {
            conversationId: conversation.id,
            caseId: conversation.case_id,
            question: questionOrAck,
            finished: false,
        };
    }

}