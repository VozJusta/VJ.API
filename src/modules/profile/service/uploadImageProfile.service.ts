import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import cloudinary from '@modules/common/cloudinary/cloudinary.client';
import streamifier from 'streamifier';

type AllowedImageMime = 'image/png' | 'image/jpeg' | 'image/webp';

@Injectable()
export class UploadImageProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeClientMime(mime: string) {
    return mime === 'image/jpg' ? 'image/jpeg' : mime;
  }

  private detectMimeFromBuffer(buffer: Buffer): AllowedImageMime | null {
    if (buffer.length >= 8) {
      const isPng =
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a;

      if (isPng) {
        return 'image/png';
      }
    }

    if (buffer.length >= 3) {
      const isJpeg =
        buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

      if (isJpeg) {
        return 'image/jpeg';
      }
    }

    if (buffer.length >= 12) {
      const riff = buffer.toString('ascii', 0, 4);
      const webp = buffer.toString('ascii', 8, 12);

      if (riff === 'RIFF' && webp === 'WEBP') {
        return 'image/webp';
      }
    }

    return null;
  }

  private assertAllowedImage(file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Arquivo não enviado');
    }

    if (file.mimetype === 'image/svg+xml') {
      throw new BadRequestException('Formato SVG não é permitido');
    }

    const detectedMime = this.detectMimeFromBuffer(file.buffer);

    if (!detectedMime) {
      throw new BadRequestException(
        'Formato de imagem inválido. Envie apenas PNG, JPG ou WEBP',
      );
    }

    const clientMime = this.normalizeClientMime(file.mimetype);

    if (
      clientMime &&
      clientMime.startsWith('image/') &&
      clientMime !== detectedMime
    ) {
      throw new BadRequestException('Tipo de arquivo não confere com o conteúdo');
    }
  }

  private uploadBuffer(buffer: Buffer, publicId: string, folder = 'avatars') {
    return new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async uploadAvatar(userId: string, role: string, file: Express.Multer.File) {
    const userRole = role?.toLowerCase?.() ?? '';

    this.assertAllowedImage(file);

    if (userRole === 'citizen') {
      const user = await this.prisma.citizen.findUnique({
        where: { id: userId },
        select: { id: true, avatar_image: true },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const publicId = `profile_${userId}`;

      const result = await this.uploadBuffer(
        file.buffer,
        publicId,
        'profiles/citizen',
      );

      const updated = await this.prisma.citizen.update({
        where: { id: userId },
        data: { avatar_image: result.secure_url },
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
        user: { id: updated.id },
      };
    }

    if (userRole === 'lawyer') {
      const user = await this.prisma.lawyer.findUnique({
        where: { id: userId },
        select: { id: true, avatar_image: true },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const publicId = `profile_${userId}`;

      const result = await this.uploadBuffer(
        file.buffer,
        publicId,
        'profiles/lawyer',
      );

      const updated = await this.prisma.lawyer.update({
        where: { id: userId },
        data: { avatar_image: result.secure_url },
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
        user: { id: updated.id },
      };
    }

    throw new ForbiddenException('Role inválida');
  }
}
