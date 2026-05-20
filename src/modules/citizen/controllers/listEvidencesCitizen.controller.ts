import { Controller, Get, HttpCode, Req, UseGuards } from "@nestjs/common";
import { 
    ListEvidenceCitizenService
 } from "../service/listEvidenceCitizen.service";
import { AuthTokenGuardAccess } from "@modules/auth/guard/access-token.guard";
import { RequestUser } from "@modules/common/interfaces/interfaces";

@Controller('me/evidences/citizenId')
export class ListEvidencesCitizenController {
    constructor(private readonly listEvidencesCitizenService: ListEvidenceCitizenService) { }
    @Get(':id')
    @HttpCode(200)
    @UseGuards(AuthTokenGuardAccess)
    async ListEvidencesCitizen(@Req() req: RequestUser) {
        return this.listEvidencesCitizenService.listEvidenceCitizen(req.user.sub);
    }
}