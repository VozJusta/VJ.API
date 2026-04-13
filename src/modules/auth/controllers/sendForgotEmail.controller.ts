import { Controller } from "@nestjs/common";
import { AuthService } from "../service/auth.service";

@Controller()
export class SendForgotEmailController {
    constructor(private authService: AuthService) {}
    
}