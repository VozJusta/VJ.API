import { Personality } from "generated/prisma/enums";

export class StartSimulationDto {
  simulationId: string;
}

export class StopSimulationDto {
  simulationId: string;
}
 
export class SimulationChatDto {
  simulationId: string;
  text: string;
}
 
export class SynthesizeDto {
  text: string;
}
 