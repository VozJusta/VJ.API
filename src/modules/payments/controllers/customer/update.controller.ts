import { AuthTokenGuardAccess } from "@modules/auth/guard/access-token.guard";
import { RequestUser } from "@modules/common/interfaces/interfaces";
import { UpdateCustomersService } from "@modules/payments/service/costumer/update.service";
import { Controller, Param, Patch, Req, UseGuards } from "@nestjs/common";

@Controller('customers')
export class UpdateCustomersController {
    constructor(
        readonly updateCustomerService: UpdateCustomersService
    ) { }
    @Patch(':id')
    @UseGuards(AuthTokenGuardAccess)
    async updateCustomer(@Param('id') id: string, @Req() req: RequestUser) {
        return await this.updateCustomerService.updateCustomer(
            id,
            req.user.fullName || '',
            req.user.email || ''
        );
    }
}