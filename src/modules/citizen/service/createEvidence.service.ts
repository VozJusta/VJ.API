import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import Tesseract from 'tesseract.js';
import * as pdfParseModule from 'pdf-parse';


@Injectable()
export class CreateEvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }
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

    const citizenId = await this.prisma.citizen.findUnique({
      where: { id: userId },
    });

    if (!citizenId) {
      throw new NotFoundException('Cidadão não encontrado');
    }


    const upload = await this.cloudinaryService.uploadFile(file);

    let extractedText = '';

    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png'
    ) {
      const ocr = await Tesseract.recognize(
        file.buffer,
        'eng',
      );

      extractedText = ocr.data.text;
    }

    if (file.mimetype === 'application/pdf') {
      const parsedPdf = await (pdfParseModule as any).default(file.buffer);

      if (parsedPdf.text.trim()) {
        extractedText = parsedPdf.text;
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


    const cleanedText = cleanOCR(extractedText);

    const evidence = await this.prisma.evidence.create({
      data: {
        file_url: upload.secure_url,
        ocr_content: cleanedText,
        public_id: upload.public_id,
        citizenId: userId
      },
    });
    return evidence;
  }
}
