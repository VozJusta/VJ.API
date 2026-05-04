import { Personality } from "generated/prisma/enums";

export type RagContext = {
    content: string;
    score: number;
};
 
export type TurnHistory = {
    role: 'User' | 'Ai';
    content: string;
};
 
export type CompleteSimulationInput = {
    personality: Personality;
    ragContexts: RagContext[];
    history: TurnHistory[];
    userMessage: string;
};
 
export type EvaluateSimulationInput = {
    transcript: string;
    personality: Personality;
};
 
export type SimulationEvaluation = {
    score: number;
    strengths: string[];
    weaknesses: string[];
    metrics: {
        clarity: number;
        argumentation: number;
        emotional_control: number;
        legal_knowledge: number;
    };
};