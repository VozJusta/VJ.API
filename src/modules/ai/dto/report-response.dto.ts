import { ApiProperty } from '@nestjs/swagger';

export class ReportResponseDto {
    @ApiProperty({
        description: 'Texto original relatado pelo usuário',
        example: 'Eu trabalhava como auxiliar de logística em uma transportadora...'
    })
    input: string;

    @ApiProperty({
        description: 'Área do direito detectada pela IA',
        example: 'Labor_and_employment'
    })
    area: string;

    @ApiProperty({
        description: 'Análise jurídica detalhada gerada pela IA com base nas leis e no contexto',
        example: 'O caso apresentado sugere violações ao Artigo 477 da CLT, que estabelece o prazo máximo de 10 dias...'
    })
    legal_analysis: string;

    @ApiProperty({
        description: 'Explicação simplificada e direta para o entendimento do cliente final',
        example: 'A empresa demitiu o empregado sem dar chance para um aviso prévio e sem pagar corretamente as horas extras...'
    })
    simplified_explanation: string;

    @ApiProperty({
        description: 'Lista de passos recomendados a seguir',
        type: [String],
        example: [
            "Contatar um advogado especializado em direito do trabalho",
            "Preparar documentação necessária para ação cabível",
            "Entregar a notificação da intenção de ajuizar ação ao empregador"
        ]
    })
    next_steps: string[];

    @ApiProperty({
        description: 'Nível de confiança da IA na resposta gerada (de 0.0 a 1.0)',
        example: 0.9
    })
    confidence: number;
}