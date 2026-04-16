import { Controller, Post } from "@nestjs/common";
import { IngestionService } from "../services/ingestion.service";

@Controller('ingest')
export class IngestionController {
    constructor(private ingestionService: IngestionService) { }

    @Post()
    async ingest() {
        await this.ingestionService.ingest([
            {
                content:
                    'O rapper e empresário Sean “Diddy” Combs foi considerado culpado por duas das cinco acusações que enfrentava na Justiça dos Estados Unidos. O júri, em Nova York, decidiu que o artista cometeu o crime de transporte para fins de prostituição, mas o absolveu das acusações mais graves, como tráfico sexual e conspiração para extorsão.O veredito foi anunciado na manhã desta quarta-feira (2), após quase dois meses de julgamento.O caso sobre o magnata da música e símbolo do rap dos anos 1990 começou a ser julgado em maio e contou com depoimentos, vídeos, imagens e argumentações da defesa e da promotoria. O júri foi composto por 12 pessoas — oito homens e quatro mulheres.Apesar do veredito, as penas pelos crimes a que Diddy foi sentenciado ainda não foram divulgadas, mas podem chegar a 20 anos de prisão.Preso desde setembro de 2024, Diddy comemorou o resultado, mas se diz inocente de todas as acusações. A defesa pediu para que o tribunal liberte o artista.',
                source: 'Lei Mann (Mann Act): Esta lei federal americana foi o ponto central que manteve o rapper preso, focando no uso de transporte para encontros sexuais pagos, filmados e organizados por ele.',
                area: 'sexual_harassment',
                type: 'law',
            },
        ]);

        return { message: 'Dados inseridos no Qdrant' };
    }
}
