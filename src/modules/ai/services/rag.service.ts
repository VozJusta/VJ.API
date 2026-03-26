import { Injectable, OnModuleInit, Scope } from "@nestjs/common";
import { EmbeddingsService } from "./embeddings.service";
import { QdrantClient } from '@qdrant/js-client-rest'

@Injectable()
export class RagService {
    constructor(private embeddingService: EmbeddingsService) { }

    private client = new QdrantClient({
        url: `${process.env.QDRANT_URL}`,
        port: 443,
        checkCompatibility: false,
    })

    async onModuleInit() {
        const collections = await this.client.getCollections();

        const exists = collections.collections.some(
            (c) => c.name === "legal_knowledge"
        );

        if (!exists) {
            await this.client.createCollection("legal_knowledge", {
                vectors: {
                    size: 1536,
                    distance: "Cosine",
                },
            });
        }
    }

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