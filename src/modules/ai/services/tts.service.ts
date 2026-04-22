import { Injectable, Logger } from "@nestjs/common";
import { DeepgramClient } from '@deepgram/sdk';

@Injectable()
export class DeepgramService {
    private readonly logger = new Logger(DeepgramService.name)
    private readonly client: DeepgramClient

    constructor() {
        this.client = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });
    }

    async transcribe(audioChunck: Buffer) {
        try {
            const response = await this.client.listen.v1.media.transcribeFile(
                audioChunck,
                {
                    model: 'nova-2',
                    language: 'pt-BR',
                    smart_format: true,
                    punctuate: true,
                }
            )

            const transcript =
                response?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? null;
        } catch (err) {
            return err
        }
    }
}