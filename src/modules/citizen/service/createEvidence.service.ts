import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import * as pdfParse from 'pdf-parse';
import Groq from 'groq-sdk';

@Injectable()
export class CreateEvidenceService {
  private readonly groq: Groq;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async createEvidence(
    file: Express.Multer.File,
    userId: string,
    role: string,
  ) {
    const userRole = role.toLowerCase();
    if (userRole !== 'citizen') {
      throw new UnauthorizedException('Apenas cidadãos podem criar evidências');
    }

    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    const maxSizeFile = 10 * 1024 * 1024;

    if (file.size > maxSizeFile) {
      throw new BadRequestException(
        'Arquivo excede o tamanho máximo permitido de 10MB',
      );
    }

    const citizen = await this.prisma.citizen.findUnique({
      where: { id: userId },
    });

    if (!citizen) {
      throw new NotFoundException('Cidadão não encontrado');
    }

    const upload = await this.cloudinaryService.uploadFile(file);

    let extractedText = '';

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      const base64Data = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64Data}`;

      const response = await this.groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: dataUrl },
              },
              {
                type: 'text',
                text: `Você é um sistema de análise de evidências para ocorrências policiais e sinistros.

Analise esta imagem e descreva detalhadamente, Limite sua resposta a no máximo 500 caracteres, incluindo:
- O que está acontecendo na cena
- Objetos, veículos ou pessoas presentes
- Danos visíveis (amassados, quebrados, arranhados, etc)
- Condições do local (rua, calçada, iluminação, etc)
- Qualquer texto visível na imagem

Seja objetivo e detalhado. Escreva em português.`,
              },
            ],
          },
        ],
      });

      extractedText = response.choices[0]?.message?.content?.trim() ?? '';

      if (extractedText === '[SEM_CONTEUDO]') {
        extractedText = '';
      }
    }



    if (file.mimetype === 'application/pdf') {
      const pdfData = new Uint8Array(file.buffer);
      const parser = new (pdfParse as any).PDFParse(pdfData, {});
      await parser.load();
      const parsedResult = await parser.getText();

      const parsedText = parsedResult.text ?? '';

      if (parsedText.trim()) {
        extractedText = parsedText;
      } else {
        throw new BadRequestException(
          'PDF sem texto detectável. OCR para PDF escaneado ainda não foi implementado.',
        );
      }
    }

    if (!extractedText.trim()) {
      throw new BadRequestException(
        'Não foi possível extrair texto do arquivo',
      );
    }

    function cleanOCR(text: string) {
      return text
        .replace(/\n+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/[^\w\s.,:À-ÿ]/g, '')
        .trim();
    }

    const cleanedText =
      file.mimetype === 'application/pdf'
        ? cleanOCR(extractedText)
        : extractedText.slice(0, 500);

    const evidence = await this.prisma.evidence.create({
      data: {
        file_url: upload.secure_url,
        ocr_content: cleanedText,
        public_id: upload.public_id,
        citizenId: userId,
      },
    });

    return evidence;
  }
}