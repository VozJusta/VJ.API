import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import cloudinary from '@modules/common/cloudinary/cloudinary.client';
import streamifier from 'streamifier';

@Injectable()
export class UploadImageProfileService {
  constructor(private readonly prisma: PrismaService) {}

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

    if (userRole === 'citizen') {
      if (!file || !file.buffer) {
        throw new BadRequestException('Arquivo não enviado');
      }

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
      if (!file || !file.buffer) {
        throw new BadRequestException('Arquivo não enviado');
      }

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
