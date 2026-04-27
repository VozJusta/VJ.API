import { BadRequestException, Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import { TranscribeAudioDTO } from "../dto/transcribe-audio.dto";
import Groq, { toFile } from "groq-sdk";

@Injectable()
export class TranscribeAudioService implements OnModuleInit {
    private groq!: Groq

    onModuleInit() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })
    }

    async transcribeAudio(file: TranscribeAudioDTO) {
        try {
            if (!file) {
                throw new BadRequestException('Nenhum arquivo enviado');
            }

            const audioFile = await toFile(file.buffer, file.originalname, {
                type: file.mimetype,
            });

            const response = await this.groq.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-large-v3',
                language: 'pt',
                response_format: 'text',
            });

            return response as unknown as string;
        } catch (error) {
            throw new InternalServerErrorException('Erro ao transcrever o áudio: ' + error);
        }
    }
}