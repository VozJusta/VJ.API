import { Injectable, OnModuleInit, Scope } from "@nestjs/common";
import { EmbeddingsService } from "@m/ai/services/embeddings.service";
import { QdrantClient } from '@qdrant/js-client-rest'

@Injectable()
export class RagService implements OnModuleInit {
    constructor(private embeddingService: EmbeddingsService) { }

    private client = new QdrantClient({
        url: `${process.env.QDRANT_URL}`,
        apiKey: `${process.env.QDRANT_API_KEY}`,
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

        try {
            await this.client.createPayloadIndex("legal_knowledge", {
                field_name: "area",
                field_schema: "keyword",
            });
        } catch (error) {
            console.log(error);

        }
    }

    async retrieve(text: string, area?: string) {
        const embedding = await this.embeddingService.generate(text)

        const results = await this.client.search('legal_knowledge', {
            vector: embedding,
            limit: 10,
            filter: area
                ? {
                    must: [
                        {
                            key: 'area',
                            match: { value: area },
                        },
                    ],
                }
                : undefined,
        })

        return results.map(r => ({
            content: String(r.payload?.content || ''),
            source: String(r.payload?.source || ''),
            score: r.score ?? 0
        }));
    }
}