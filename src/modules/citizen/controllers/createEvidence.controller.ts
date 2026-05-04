import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('me')
export class CreateEvidenceController {
  constructor() {}
  @Post('evidence')
  @UseInterceptors(FileInterceptor('file'))
  async createEvidence(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'Evidência recebida com sucesso',
      fileName: file.originalname,
      fileSize: file.size,
    };
  }
}
