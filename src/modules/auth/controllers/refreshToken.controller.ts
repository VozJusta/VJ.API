import { Controller, Headers, Post } from '@nestjs/common';
import { RefreshTokenService } from '../service/refreshToken.service';
import { ApiTags } from '@nestjs/swagger';
@Controller()
export class RefreshToken {
  constructor(private refreshTokenService: RefreshTokenService) {}
  @ApiTags('Auth')
  @Post('refresh-token')
  async refreshToken(@Headers('refreshToken') RefreshToken: string) {
    return this.refreshTokenService.refreshToken(RefreshToken);
  }
}
