import { Injectable, Scope } from "@nestjs/common";
import { EmbeddingsService } from "./embeddings.service";
import { QdrantClient } from '@qdrant/js-client-rest'

@Injectable()
export class RagService {
    constructor(private embeddingService: EmbeddingsService) { }

    private client = new QdrantClient({
        url: 'http://localhost:6333'
    })

    async retrieve(text: string) {
        const embedding = await this.embeddingService.generate(text)

        const results = await this.client.search('legal_knowledge', {
            vector: embedding,
            limit: 5,
        })

        return results.map(r => ({
            content: r.payload?.content,
            source: r.payload?.source,
            score: r.score
        }));

    }
}