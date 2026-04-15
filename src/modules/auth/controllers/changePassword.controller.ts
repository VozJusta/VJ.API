import { Patch, UseGuards, Body, Req, Controller } from '@nestjs/common';
import { ChangePasswordDTO } from '@m/auth/dto/change-password.dto';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { ChangePasswordService } from '@m/auth/service/changePassword.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

interface RequestUser extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@ApiTags('Auth')
@Controller()
export class ChangePasswordController {
  constructor(private readonly authService: ChangePasswordService) {}

  @Patch('change-password')
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Altera a senha do usuário autenticado' })
  @ApiBody({
    type: ChangePasswordDTO,
    examples: {
      default: {
        summary: 'Troca de senha',
        value: {
          currentPassword: '@Za12345678',
          newPassword: '@Za87654321',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso',
    schema: { example: { message: 'Senha atualizada com sucesso' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou senha atual incorreta',
    schema: {
      example: {
        statusCode: 401,
        message: 'Senha incorreta',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário autenticado não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Nova senha igual à senha anterior',
    schema: {
      example: {
        statusCode: 409,
        message: 'Senha não pode ser igual a anterior',
        error: 'Conflict',
      },
    },
  })
  async changePassword(
    @Body() body: ChangePasswordDTO,
    @Req() req: RequestUser,
  ) {
    return await this.authService.changePassword(body, req.user.sub);
  }
}
