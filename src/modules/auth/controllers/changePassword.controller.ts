import { Patch, UseGuards, Body, Req } from "@nestjs/common";
import { ChangePasswordDTO } from "../dto/change-password.dto";
import { AuthTokenGuard } from "../guard/access-token.guard";
import { AuthService } from "../service/auth.service";

interface RequestUser extends Request {
  user: {
    sub: string,
    role: string
  }
}

export class ChangePasswordController {
  constructor(private authService: AuthService) {}
  @Patch('change-password')
  @UseGuards(AuthTokenGuard)
  async changePassword(
    @Body() body: ChangePasswordDTO,
    @Req() req: RequestUser,
  ) {
    return await this.authService.changePassword(body, req.user.sub);
  }
}
