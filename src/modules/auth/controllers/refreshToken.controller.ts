import { Controller, Headers } from "@nestjs/common";


@Controller()
export class RefreshToken {
    constructor() {}
    async refreshToken(@Headers('refreshToken') RefreshToken: string) {
        return this
    }
}