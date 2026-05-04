import { IsNotEmpty } from "class-validator";

export class ReportReadyDTO {

    @IsNotEmpty({ message: 'O campo simulationId é obrigatório '})
    readonly simulationId: string;

    @IsNotEmpty({ message: 'O campo reportId é obrigatório '})
    readonly reportId: string;

    @IsNotEmpty({ message: 'O campo citizenId é obrigatório '})
    readonly citizenId: string;
}