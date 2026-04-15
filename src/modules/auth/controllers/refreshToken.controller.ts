import { Controller, Headers, Post } from '@nestjs/common';
import { RefreshTokenService } from '../service/refreshToken.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Refresh')
@Controller()
export class RefreshToken {
  constructor(private refreshTokenService: RefreshTokenService) {}

  @Post('refresh-token')
  async refreshToken(@Headers('refreshToken') RefreshToken: string) {
    return this.refreshTokenService.refreshToken(RefreshToken);
  }
}
