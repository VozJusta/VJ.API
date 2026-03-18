import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

@Injectable()
export class LlmService {
    constructor(private httpService: HttpService) { }

    async generate({ input, context }: any) {
        const prompt = `Você é um assistente jurídico
        
        Relato:
${input}

Contexto:
${context.map(c => c.content).join('\n')}

Responda em JSON:
{
  "area": "",
  "analysis": "",
  "explanation": "",
  "next_steps": [],
  "confidence": 0
}`

        const response = await firstValueFrom(
            this.httpService.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'mixtral-8x7b-32768',
                    messages: [{ role: 'user', content: prompt }],
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                }
            )
        );

        const content = response.data.choices[0].message.content;

        return {
            prompt,
            output: JSON.parse(this.cleanJson(content)),
        };
    }

    private cleanJson(text: string) {
        return text.replace(/```json|```/g, '').trim();
    }

}