import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

type GenerateInput = {
    input: string;
    context: { content: string }[];
};

type LlmOutput = {
    area: string;
    legal_analysis: string;
    simplified_explanation: string;
    next_steps: string[];
    confidence: number;
};

@Injectable()
export class LlmService {
    constructor(private httpService: HttpService) { }

    async generate({ input, context }: GenerateInput): Promise<{
        prompt: string;
        output: LlmOutput;
    }> {

        const prompt = `Você é um assistente jurídico.

        Responda EXCLUSIVAMENTE em JSON válido.
        - NÃO use markdown
        - NÃO use blocos de código
        - NÃO use \`\`\`
        - NÃO escreva nada fora do JSON
        - "next_steps" DEVE ser um array de strings

        Relato:
        ${input}

        Contexto:
        ${context.map(c => c.content).join('\n')}

        Use apenas UMA dessas áreas:
        Administrative, Customs, Legal_support, Aviation, Agrarian, Environmental, Arbitration, Copyright,
        Banking_and_financial, Biotechnology, Civil, Commercial, International_trade, Competition,
        Constitutional, Consumer, Commercial_contracts, Sports, Water, Third_sector, Economic,
        Electoral, Corporate_criminal, Energy, Bankruptcy, Family, Mergers, Real_estate,
        Import_and_export, Infrastructure, International, Internet_and_ECommerce, Maritime,
        Capital_markets, Mining, Financial_operations, Criminal, Oil_and_gas, Social_security,
        Project_finance, Intellectual_property, Corporate_restructuring, Regulatory,
        Health_and_sanitary, Insurance, Labor_union, Corporate, Telecommunications,
        Labor_and_employment, Tax

        REGRAS IMPORTANTES DE QUALIDADE:

        - "legal_analysis" deve ser EXTREMAMENTE detalhado (mínimo 150 palavras)
        - Analise juridicamente o caso com profundidade
        - Identifique possíveis violações legais
        - Explique direitos aplicáveis
        - Use linguagem técnica, mas clara
        - Pode citar princípios jurídicos (sem inventar leis específicas)

        - "simplified_explanation" deve ser uma versão mais simples (mínimo 100 palavras)
        - Explique como se estivesse falando com uma pessoa leiga
        - Use linguagem acessível
        - Dê exemplos práticos se possível

        - Evite respostas genéricas
        - Seja específico com base no relato
        - Se o contexto ajudar, utilize-o na análise

        Formato:
        {
        "area": "",
        "legal_analysis": "",
        "simplified_explanation": "",
        "next_steps": [],
        "confidence": 0
        }
        
        Exemplo de resposta válida:
        {
        "area": "Civil",
        "legal_analysis": "Texto longo...",
        "simplified_explanation": "Texto...",
        "next_steps": ["Passo 1", "Passo 2"],
        "confidence": 0.85
        }
        `;

        const response = await firstValueFrom(
            this.httpService.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'user', content: prompt },
                        { role: 'system', content: 'Você responde apenas JSON válido. Nunca escreva texto fora do JSON.'}
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                }
            )
        );

        const content = response.data.choices[0].message.content;

        return {
            prompt,
            output: this.extractJson(content),
        };
    }

    private extractJson(text: string): LlmOutput {
        try {
            return JSON.parse(text);
        } catch {
            const cleaned = text
                .replace(/```json|```/g, '')
                .replace(/\*\*/g, '')
                .trim();

            const match = cleaned.match(/\{[\s\S]*\}/);

            if (!match) {
                throw new Error('JSON não encontrado');
            }

            return JSON.parse(match[0]);
        }
    }
}