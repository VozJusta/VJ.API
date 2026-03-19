import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { OabState } from "generated/prisma/enums"

export class ValidateLawyerDTO {
    @IsString()
    @IsNotEmpty()
    readonly nomeAdvo: string

    @IsNotEmpty()
    @IsString()
    readonly insc: string

    @IsEnum(OabState)
    @IsNotEmpty()
    readonly uf: OabState
}