import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ValidateLawyerDTO } from 'src/lawyer/dto/validate-lawyer.dto';

const DEFAULT_OAB_API_URL = 'https://cna.oab.org.br/Home/Search';

@Injectable()
export class OabNumberValidationService {
    private readonly oabApiUrl: string;

    constructor(
        private readonly http: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.oabApiUrl = this.configService.get<string>('OAB_API_URL') ?? DEFAULT_OAB_API_URL;
    }

    async validate(body: ValidateLawyerDTO) {
        const response = await firstValueFrom(
            this.http.post(
                this.oabApiUrl,
                {
                    NomeAdvo: body.nomeAdvo,
                    Insc: body.insc,
                    Uf: body.uf,
                    TipoInsc: ''
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0',
                    }
                }
            )
        )

        return response.data;
    }
}
