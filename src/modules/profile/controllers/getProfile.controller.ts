import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ShowProfileService } from "@m/profile/service/showProfile.service";
import { AuthTokenGuardAccess } from "@modules/auth/guard/access-token.guard";
import { RequestUser } from "@modules/common/interfaces/interfaces";

@Controller('profile')
export class GetProfileController{
    constructor(private readonly showProfile: ShowProfileService){}

    @Get()
    @UseGuards(AuthTokenGuardAccess)
    async getProfile(@Req() req: RequestUser){
        const userId = req.user.sub;
        const role = req.user.role;

        return this.showProfile.showProfileByRole(userId, role)
    }
}