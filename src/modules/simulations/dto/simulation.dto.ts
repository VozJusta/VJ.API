export class StartSimulationDto {
  simulationId: string;
  reportId?: string;
}
 
export class AudioChunkDto {
  simulationId: string;
  chunk: Buffer;
}
 
export class StopSimulationDto {
  simulationId: string;
}
 
export class SimulationTurnDto {
  simulationId: string;
  role: 'User' | 'Ai';
  content: string;
  audioUrl?: string;
}
 
export class CreateSimulationDto {
  userId: string;
  reportId?: string;
  personality: Personality;
}