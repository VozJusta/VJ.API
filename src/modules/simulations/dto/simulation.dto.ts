import { IsNotEmpty } from "class-validator";

export class StartSimulationDto {
  @IsNotEmpty({ message: 'O campo simulationId é obrigatório' })
  simulationId: string;

  @IsNotEmpty({ message: 'O campo citizenId é obrigatório' })
  citizenId: string
}

export class StopSimulationDto {
  @IsNotEmpty({ message: 'O campo simulationId é obrigatório' })
  simulationId: string;
}
 
export class SimulationChatDto {

  @IsNotEmpty({ message: 'O campo simulationId é obrigatório' })
  simulationId: string;

  @IsNotEmpty({ message: 'O campo text é obrigatório' })
  text: string;
}
 
export class SynthesizeDto {

  @IsNotEmpty({ message: 'O campo text é obrigatório' })
  text: string;
}
 