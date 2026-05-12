import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateEvidenceService } from '../service/createEvidence.service';

@Controller('me')
@UseInterceptors(FileInterceptor('file', {
  limits: {
    fileSize:10 * 1024 * 1024
  },
   fileFilter: (req, file, callback) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(
          new BadRequestException('Tipo de arquivo inválido'),
          false,
        );
      }

      callback(null, true);
    },
}))
export class CreateEvidenceController {
  constructor(
    private readonly createEvidenceService: CreateEvidenceService
  ) { }
  @Post('evidence')
  @UseGuards(AuthTokenGuardAccess)
  @UseInterceptors(FileInterceptor('file'))
  async createEvidence(@UploadedFile() file: Express.Multer.File, @Req() req: RequestUser) {
    return await this.createEvidenceService.createEvidence(
      file,
      req.user.sub,
      req.user.role,
    )
  }
}
