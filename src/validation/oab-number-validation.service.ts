import { HttpService } from '@nestjs/axios'
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ValidateLawyerDTO } from 'src/lawyer/dto/validate-lawyer.dto';

@Injectable()
export class OabNumberValidationService {
    private readonly logger = new Logger(OabNumberValidationService.name);

    constructor(private readonly http: HttpService) { }

    async validate(body: ValidateLawyerDTO) {
        try {
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
        } catch (error) {
            this.logger.error('OAB validation service error', error);
            throw new ServiceUnavailableException('Serviço de validação da OAB indisponível no momento. Tente novamente mais tarde.');
        }
    }
}
