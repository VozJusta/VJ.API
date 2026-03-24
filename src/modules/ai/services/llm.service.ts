import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

@Injectable()
export class LlmService {
    constructor(private httpService: HttpService) { }

    async generate({ input, context }: any) {
        const prompt = `Você é um assistente jurídico

            Responda EXCLUSIVAMENTE em JSON válido.
            - NÃO use markdown
            - NÃO use blocos de código
            - NÃO use quebras de linha dentro de strings (use \\n)
            - NÃO escreva nada fora do JSON
        
            Relato:
            ${input}

            Contexto:
            ${context.map(c => c.content).join('\n')}

            Responda em JSON:
            {
            "area": "",
            "analysis": "",
            "explanation": "",
            "next_steps": "",
            "confidence": 0
            }`

        const response = await firstValueFrom(
            this.httpService.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'user', content: prompt },
                        { role: 'system', content: 'Você responde apenas JSON válido. Nunca escreva texto fora do JSON.'}
                    ],
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
            output: this.extractJson(content),
        };
    }

    private extractJson(text: string) {
        try {
            return JSON.parse(text);
        } catch {
            const cleaned = text
                .replace(/```json|```/g, '')
                .replace(/\*\*/g, '')
                .trim();
            const match = cleaned.match(/\{[\s\S]*\}/);

            if (!match) {
                throw new Error('JSON não encontrado na resposta do modelo');
            }

            try {
                return JSON.parse(match[0]);
            } catch (err) {
                console.error('Erro ao parsear JSON:', match[0]);
                throw err;
            }
        }
    }

}