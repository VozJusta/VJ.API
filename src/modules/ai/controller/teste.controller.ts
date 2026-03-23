import { Body, Controller, Param, Post } from "@nestjs/common";
import { AiService } from "../services/ai.service";

@Controller('teste')
export class TesteController {
    constructor(private readonly aiService: AiService) {}

    @Post()
    async test(@Body('text') text: string, @Body('user_id') userId: string) {
        return await this.aiService.analyzeReport(text, userId)
    }
}