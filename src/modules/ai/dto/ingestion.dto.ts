import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Specialization } from "generated/prisma/enums";

export class IngestionDTO {

    @IsOptional()
    @IsString()
    readonly id?: string;

    @IsNotEmpty({ message: 'Campo content é obrigatório' })
    @IsString()
    readonly content: string

    @IsNotEmpty({ message: 'Campo source é obrigatório' })
    @IsString()
    readonly source: string

    @IsNotEmpty({ message: 'Campo title é obrigatório' })
    @IsString()
    readonly title: string;

    @IsEnum(Specialization)
    @IsNotEmpty({ message: 'Campo area é obrigatório' })
    readonly area: Specialization
}