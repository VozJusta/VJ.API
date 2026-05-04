import { Injectable, Logger } from "@nestjs/common";
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

@Injectable()
export class TtsService {
    private readonly logger = new Logger(TtsService.name);

    async synthesize(text: string) {
        try {
            const tts = new MsEdgeTTS()

            await tts.setMetadata(
                'pt-BR-AntonioNeural',
                OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
            )

            const { audioStream } = tts.toStream(text)

            const chunks: Buffer[] = [];

            await new Promise<void>((resolve, reject) => {
                audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
                audioStream.on('end', resolve);
                audioStream.on('error', reject);
            });

            tts.close();

            return Buffer.concat(chunks);
        } catch (err) {
            this.logger.error('Falha ao sintetizar o audio', err)
            throw err
        }
    }
}