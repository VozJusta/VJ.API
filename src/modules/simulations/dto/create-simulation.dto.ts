import { IsNotEmpty, IsOptional } from "class-validator"
import { Personality } from "generated/prisma/enums"

export class CreateSimulationDTO {
    @IsNotEmpty()
    personality: Personality

    @IsOptional()
    reportId: string
}