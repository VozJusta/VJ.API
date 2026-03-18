import { Injectable } from "@nestjs/common";
import axios, { HttpService } from '@nestjs/axios'
import { firstValueFrom, Observable } from "rxjs";

@Injectable()
export class EmbeddingsService {
    constructor(private httpService: HttpService) {}

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

        return response.data.data[0].embedding
    }
}