import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

@Injectable()
export class CpfNumberValidation {
    constructor(
        private readonly http: HttpService
    ) { }

    async validate(cpf: string) {
        const response = await firstValueFrom(
            this.http.post(
                "https://cpfgenerator.org/api/cpf/validator",
                {
                    values: cpf,
                    format: true
                }
            )
        )

        return response.data.data.summary;
    }
}