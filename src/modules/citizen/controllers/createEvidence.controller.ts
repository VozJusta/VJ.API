import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateEvidenceService } from '../service/createEvidence.service';

@Controller('me')
@UseInterceptors(FileInterceptor('file'))
export class CreateEvidenceController {
  constructor(
    private readonly createEvidenceService: CreateEvidenceService
  ) { }
  @Post('evidence')
  @UseGuards(AuthTokenGuardAccess)
  async createEvidence(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({
          maxSize: 10 * 1024 * 1024,
          message: 'O arquivo deve ter no máximo 10MB',
        }),
        new FileTypeValidator({
          fileType: /(jpg|jpeg|png|pdf)$/,
        }),
      ],
    }),
  )
  file: Express.Multer.File, @Req() req: RequestUser) {
    return await this.createEvidenceService.createEvidence(
      file,
      req.user.sub,
      req.user.role,
    )
  }
}
