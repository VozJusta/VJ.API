import { BadRequestException, Controller, Patch, UploadedFile, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadImageProfileService } from '@m/profile/service/uploadImageProfile.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';

@Controller('profile')
export class UploadProfileImageController {
  constructor(private readonly uploadService: UploadImageProfileService) {}

  @Patch('avatar')
  @UseGuards(AuthTokenGuardAccess)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Apenas imagens são permitidas'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(@Req() req: RequestUser, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub;
    const role = req.user.role?.toLowerCase?.() ?? '';

    const res = await this.uploadService.uploadAvatar(userId, role, file);
    return res;
  }
}
