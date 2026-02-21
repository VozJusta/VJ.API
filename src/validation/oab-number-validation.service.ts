import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ValidateLawyerDTO } from 'src/lawyer/dto/validate-lawyer.dto';

@Injectable()
export class OabNumberValidationService {
    constructor(private readonly http: HttpService) { }

    async validate(body: ValidateLawyerDTO) {
        const response = await firstValueFrom(
            this.http.post(
                'https://cna.oab.org.br/Home/Search',
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
