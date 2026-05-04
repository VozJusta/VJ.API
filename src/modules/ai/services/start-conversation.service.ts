import { Injectable } from "@nestjs/common";
import { LlmService } from "./llm.service";
import { PrismaService } from "@modules/prisma/service/prisma.service";
import { StartConversationDTO } from "../dto/start-conversation.dto";
import { ReportService } from "./report.service";

@Injectable()
export class StartConversationService {
    constructor(
        private llmService: LlmService,
        private prisma: PrismaService,
        private generateReport: ReportService
    ) { }

    async startConversation(firstMessage: StartConversationDTO, userId: string) {
        const newCase = await this.prisma.case.create({
            data: {
                title: firstMessage.message.slice(0, 60),
                citizen_id: userId,
                status: 'Pending'
            }
        })

        const conversation = await this.prisma.conversation.create({
            data: {
                case_id: newCase.id,
                messages: {
                    create: {
                        role: 'User',
                        content: firstMessage.message,
                    }
                }
            },
            include: {
                messages: true
            }
        })

        const { shouldGenerate, questionOrAck } = await this.llmService.chat([
            { role: 'User', content: firstMessage.message }
        ])

        await this.prisma.message.create({
            data: {
                conversation_id: conversation.id,
                role: 'Assistant',
                content: questionOrAck
            }
        })

        if (shouldGenerate) {
            await this.generateReport.generateReportFromConversation(conversation.id, newCase.id, userId)
        }

        return {
            conversationId: conversation.id,
            caseId: newCase.id,
            question: questionOrAck,
            finished: false,
        }
    }
}