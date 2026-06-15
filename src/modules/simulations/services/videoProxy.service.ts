import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class VideoProxyService {
  constructor() {}
  async videoProxy(url: string, sessionHash: string, res: Response) {
    if (!url) return res.status(400).json({ error: 'URL não fornecida' });

    const ALLOWED_HOST = 'ooliveiratg-gradio-lipsync-wav2lip.hf.space';
    const parsed = new URL(url);
    if (parsed.hostname !== ALLOWED_HOST) {
      return res.status(403).json({ error: 'URL não permitida' });
    }

    const response = await fetch(url, {
      headers: {
        Referer: 'https://ooliveiratg-gradio-lipsync-wav2lip.hf.space',
        Origin: 'https://ooliveiratg-gradio-lipsync-wav2lip.hf.space',
        Accept: 'video/mp4,video/*,*/*',
        Cookie: `session_hash=${sessionHash}`,
      },
    });

    if (!response.ok) {
      console.log('HF retornou:', response.status, await response.text());
      return res
        .status(response.status)
        .json({ error: 'Falha ao buscar vídeo' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'no-cache');

    const reader = response.body!.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(Buffer.from(value));
      pump();
    };
    pump();
  }
}
