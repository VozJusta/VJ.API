import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import Tesseract from 'tesseract.js';

@Injectable()
export class CreateEvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
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
    console.log(upload);

    const ocr = await Tesseract.recognize(file.buffer, 'eng');

    const evidence = await this.prisma.evidence.create({
      data: {
        file_url: upload.secure_url,
        ocr_content: ocr.data.text,
        public_id: upload.public_id,
      },
    });
    return evidence;
  }
}
