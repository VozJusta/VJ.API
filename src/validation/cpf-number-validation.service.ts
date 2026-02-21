import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

const DEFAULT_CPF_API_URL = 'https://cpfgenerator.org/api/cpf/validator';

@Injectable()
export class CpfNumberValidation {
    private readonly cpfApiUrl: string;

    constructor(
        private readonly http: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.cpfApiUrl = this.configService.get<string>('CPF_API_URL') ?? DEFAULT_CPF_API_URL;
    }

    async validate(cpf: string) {
        const response = await firstValueFrom(
            this.http.post(
                this.cpfApiUrl,
                {
                    values: cpf,
                    format: true
                }
            )
        )

        return response.data.data.summary;
    }
}