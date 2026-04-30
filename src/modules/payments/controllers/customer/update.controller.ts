import { Controller, Patch, UseGuards } from "@nestjs/common";

@Controller('customers')
export class UpdateCustomersController {
    constructor(
        readonly updateCustomerService: UpdateCustomersController
    ) { }
    @Patch(':id')
    @UseGuards(AuthGuard)
    async updateCustomer() {
        return await this.updateCustomerService.updateCustomer();
    }
}