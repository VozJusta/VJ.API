import { Injectable } from "@nestjs/common";
import { EmbeddingsService } from "./embeddings.service";
import { QdrantClient } from "@qdrant/js-client-rest";

@Injectable()
export class IngestionService {
    constructor(private embeddingService: EmbeddingsService) { }

    private client = new QdrantClient({
        url: 'https://vj-ia.onrender.com',
        port: 443,
        checkCompatibility: false,
    });

    async ingest(items: any[]) {
        for (const item of items) {
            const embedding = await this.embeddingService.generate(item.content);

            await this.client.upsert('legal_knowledge', {
                points: [
                    {
                        id: crypto.randomUUID(),
                        vector: embedding,
                        payload: item,
                    },
                ],
            });
        }
    }
}