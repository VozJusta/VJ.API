import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

@Injectable()
export class CnpjNumberValidation {
    constructor(private readonly http: HttpService) {}

    async validate(cnpj: string) {
        const response = await firstValueFrom(
            this.http.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
        )

        return response.data
    }
}