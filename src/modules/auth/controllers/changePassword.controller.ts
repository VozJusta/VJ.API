import { Patch, UseGuards, Body, Req, Controller } from "@nestjs/common";
import { ChangePasswordDTO } from "../dto/change-password.dto";
import { AuthTokenGuard } from "../guard/access-token.guard";
import { ChangePasswordService } from "../service/changePassword.service";
import { ApiTags } from "@nestjs/swagger";

interface RequestUser extends Request {
  user: {
    sub: string,
    role: string
  }
}

@Controller()
export class ChangePasswordController {
  constructor(private changePasswordService: ChangePasswordService) {}
  @Patch('change-password')
  @UseGuards(AuthTokenGuard)
    @ApiTags('Auth')
  
  async changePassword(
    @Body() body: ChangePasswordDTO,
    @Req() req: RequestUser,
  ) {
    return await this.changePasswordService.changePassword(body, req.user.sub);
  }
}
