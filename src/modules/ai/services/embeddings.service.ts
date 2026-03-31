import { Injectable } from "@nestjs/common";
import axios, { HttpService } from '@nestjs/axios'
import { firstValueFrom, Observable } from "rxjs";

@Injectable()
export class EmbeddingsService {
    constructor(private httpService: HttpService) { }

    async generate(text: string): Promise<number[]> {
        const response = await firstValueFrom(
            this.httpService.post(
                'https://openrouter.ai/api/v1/embeddings',
                {
                    model: 'text-embedding-3-small',
                    input: text,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
                    }
                }
            )
        )

        const data = response.data;

        if (!data?.data || !data.data[0]?.embedding) {
            console.error('Erro no embedding:', data);
            throw new Error('Falha ao gerar embedding');
        }

        return data.data[0].embedding
    }

    async generateBatch(texts: string[]): Promise<number[][]> {
        const embeddings: number[][] = [];

        for (const text of texts) {
            embeddings.push(await this.generate(text));

            await new Promise(r => setTimeout(r, 100));
        }

        return embeddings;
    }
}