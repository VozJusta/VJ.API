import { Body, Controller, Post } from "@nestjs/common";
import { CustomerConfigService } from "../config/customer.config";

@Controller('payment')
export class PaymentController {
    constructor(private readonly customer: CustomerConfigService) {}

    @Post()
    async configCustomer(@Body('email') email: string) {
        return await this.customer.configCustomer(email)
    }
}