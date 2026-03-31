import { Injectable } from "@nestjs/common";
import { EmbeddingsService } from "./embeddings.service";
import { QdrantClient } from "@qdrant/js-client-rest";
import { IngestionDTO } from "../dto/ingestion.dto";

type QdrantPoint = {
    id: string;
    vector: number[];
    payload: {
        content: string;
        source: string;
        type: string;
        area: string;
        title: string;
        lawId?: string;
    };
};

@Injectable()
export class IngestionService {
    constructor(private embeddingService: EmbeddingsService) { }

    private client = new QdrantClient({
        url: `${process.env.QDRANT_URL}`,
        port: 443,
        checkCompatibility: false,
    });

    private chunkText(text: string, size = 500, overlap = 50): string[] {
        const chunks: string[] = [];

        for (let i = 0; i < text.length; i += size - overlap) {
            chunks.push(text.slice(i, i + size));
        }

        return chunks;
    }

    async ingest(items: IngestionDTO[]): Promise<void> {
        let points: QdrantPoint[] = [];

        for (const item of items) {

            if (!item.content || item.content.length < 50) {
                continue;
            }

            const chunks = this.chunkText(item.content);

            const embeddings = await this.embeddingService.generateBatch(chunks);

            for (let i = 0; i < chunks.length; i++) {
                points.push({
                    id: crypto.randomUUID(),
                    vector: embeddings[i],
                    payload: {
                        content: `${item.title}\n\n${chunks[i]}`,
                        source: item.source,
                        type: 'law',
                        area: item.area,
                        title: item.title,
                        lawId: item.id,
                    },
                });
            }

            if (points.length >= 100) {
                await this.client.upsert('legal_knowledge', { points });
                points = [];
            }
        }

        if (points.length > 0) {
            await this.client.upsert('legal_knowledge', { points });
        }
    }

}