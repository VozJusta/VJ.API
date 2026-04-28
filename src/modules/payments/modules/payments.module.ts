import { Global, Module } from "@nestjs/common";
import { CustomerConfigService } from "../config/customer.config";
import { PaymentController } from "../controllers/teste.controller";
@Global()
@Module({
    imports:[],
    controllers:[PaymentController],
    providers:[CustomerConfigService],
    exports:[]
})
export class PaymentModule {}