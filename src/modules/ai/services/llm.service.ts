import { PERSONALITY_PROMPTS } from "@modules/common/prompts/personality-prompts";
import { CompleteSimulationInput, EvaluateSimulationInput, SimulationEvaluation } from "@modules/common/types/simulation.types";
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

type ConversationMessage = {
    role: 'User' | 'Assistant';
    content: string;
};

type ChatDecision = {
    shouldGenerate: boolean;
    questionOrAck: string;
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
        "area": "área",
        "legal_analysis": "Texto longo...",
        "simplified_explanation": "Texto...",
        "next_steps": ["Passo 1", "Passo 2"],
        "confidence": "entre 1 e 100"
        }
        `;

        const response = await firstValueFrom(
            this.httpService.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'user', content: prompt },
                        { role: 'system', content: 'Você responde apenas JSON válido. Nunca escreva texto fora do JSON.' }
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

    async chat(messages: ConversationMessage[]): Promise<ChatDecision> {
        const history = messages
            .map(m => `${m.role === 'User' ? 'Usuário' : 'Assistente'}: ${m.content}`)
            .join('\n');

        const prompt = `Você é um assistente jurídico coletando informações para montar um relatório jurídico completo.

        Analise o histórico da conversa abaixo e decida:
        - Se já tem informações suficientes para gerar um relatório jurídico detalhado, responda com shouldGenerate: true
        - Se ainda faltam informações relevantes, faça UMA pergunta objetiva e curta

        Responda EXCLUSIVAMENTE em JSON válido, sem markdown, sem texto fora do JSON.

        Formato:
        {
        "shouldGenerate": false,
        "questionOrAck": "Sua pergunta aqui ou mensagem de confirmação"
        }

        Histórico:
        ${history}`;

        const response = await firstValueFrom(
            this.httpService.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'user', content: prompt },
                        { role: 'system', content: 'Você responde apenas JSON válido. Nunca escreva texto fora do JSON.' }
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
        return this.extractChatDecision(content);
    }

    async completeSimulation({
        personality,
        ragContexts,
        history,
        userMessage,
    }: CompleteSimulationInput): Promise<string> {

        const contextText = ragContexts.length
            ? ragContexts.map(c => c.content).join('\n\n')
            : 'Nenhum contexto jurídico adicional disponível.';

        const historyText = history
            .map(t => `${t.role === 'User' ? 'Usuário' : 'IA'}: ${t.content}`)
            .join('\n');

        const systemPrompt = `${PERSONALITY_PROMPTS[personality]}
 
        Você está conduzindo uma simulação de audiência judicial com fins educativos.
        O objetivo é treinar o usuário para audiências reais.
        Nunca quebre o personagem. Responda de forma natural e conversacional.
        Máximo de 3 frases por resposta para manter o ritmo da audiência.
        Não use markdown, não use listas, apenas texto corrido.`;

                const userPrompt = `Contexto jurídico do caso:
        ${contextText}
        
        Histórico da audiência:
        ${historyText}
        
        Usuário: ${userMessage}`;

        const response = await firstValueFrom(
            this.httpService.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.7,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                }
            )
        );

        return response.data.choices[0].message.content?.trim() ?? '';
    }

    async evaluateSimulation({
        transcript,
        personality,
    }: EvaluateSimulationInput): Promise<SimulationEvaluation> {

        const prompt = `Você é um avaliador especialista em simulações de audiências judiciais.
 
        Avalie a performance do usuário na transcrição abaixo.
        A audiência usou o perfil de personalidade: ${personality}.
        
        TRANSCRIÇÃO:
        ${transcript}
        
        Responda EXCLUSIVAMENTE em JSON válido, sem markdown, sem texto fora do JSON.
        
        Formato:
        {
        "score": <número inteiro de 0 a 100>,
        "strengths": ["<ponto forte>"],
        "weaknesses": ["<ponto a melhorar>"],
        "metrics": {
            "clarity": <0 a 10>,
            "argumentation": <0 a 10>,
            "emotional_control": <0 a 10>,
            "legal_knowledge": <0 a 10>
        }
        }`;

        const response = await firstValueFrom(
            this.httpService.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'user', content: prompt },
                        { role: 'system', content: 'Você responde apenas JSON válido. Nunca escreva texto fora do JSON.' },
                    ],
                    temperature: 0.3,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                }
            )
        );

        const content = response.data.choices[0].message.content;

        try {
            return this.extractJson(content) as unknown as SimulationEvaluation;
        } catch {
            return {
                score: 0,
                strengths: [],
                weaknesses: [],
                metrics: {
                    clarity: 0,
                    argumentation: 0,
                    emotional_control: 0,
                    legal_knowledge: 0,
                },
            };
        }
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

    private extractChatDecision(text: string): ChatDecision {
        try {
            return JSON.parse(text);
        } catch {
            const cleaned = text.replace(/```json|```/g, '').trim();
            const match = cleaned.match(/\{[\s\S]*\}/);

            if (!match) {
                return {
                    shouldGenerate: false,
                    questionOrAck: 'Pode me dar mais detalhes sobre o ocorrido?'
                };
            }

            return JSON.parse(match[0]);
        }
    }

}