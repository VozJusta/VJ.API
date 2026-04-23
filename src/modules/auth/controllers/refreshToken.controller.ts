import { Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { RefreshTokenService } from '@m/auth/service/refreshToken.service';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { RequestUser } from '@m/common/interfaces/interfaces';

@ApiTags('Refresh')
@Controller()
export class RefreshToken {
  constructor(private refreshTokenService: RefreshTokenService) {}
  @UseGuards(AuthTokenGuard)
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Gera novo access token a partir do refresh token',
    description:
      'Valida o refresh token enviado no header e retorna um novo access token válido.',
  })
  @ApiHeader({
    name: 'refreshToken',
    required: true,
    description: 'Refresh token JWT para renovar o access token.',
    schema: {
      type: 'string',
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwiZW1haWwiOiJ4c0BnbWFpbC5jb20iLCJyb2xlIjoiY2l0aXplbiJ9.signature',
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Novo access token gerado com sucesso.',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwiZW1haWwiOiJ4c0BnbWFpbC5jb20iLCJyb2xlIjoiY2l0aXplbiJ9.signature',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado ou ausente.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Refresh token está inválido ou expirado',
        error: 'Unauthorized',
      },
    },
  })
  async refreshToken(@Req() req: RequestUser) {
    return this.refreshTokenService.refreshToken(
      req.user.role,
      req.user.sub,
      req.user.sessionId,
      req.user.loggedWithGoogle,
    );
  }
}
