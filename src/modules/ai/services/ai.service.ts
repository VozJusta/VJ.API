import { Injectable } from "@nestjs/common";
import { RagService } from "./rag.service";
import { LlmService } from "./llm.service";
import { PrismaService } from "src/modules/prisma/service/prisma.service";

@Injectable()
export class AiService {
    constructor(
        private ragService: RagService,
        private llmService: LlmService,
        private prisma: PrismaService
    ) { }

    async analyzeReport(text: string) {
        const context = await this.ragService.retrieve(text)

        const response = await this.llmService.generate({
            input: text,
            context,
        })

        return {
            input: text,
            ...response.output,
            context,
        }
    }
}