import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Specialization } from "generated/prisma/enums";

export class PdfReportDTO {
    
    @IsString()
    @IsNotEmpty({ message: 'O campo input é obrigatório' })
    readonly input: string

    @IsEnum(Specialization)
    @IsNotEmpty({ message: 'O campo area é obrigatório'})
    readonly area: Specialization

    @IsString()
    @IsNotEmpty({ message: 'O campo analysis é obrigatório' })
    readonly analysis: string

    @IsString()
    @IsNotEmpty({ message: 'O campo explanation é obrigatório' })
    readonly explanation: string

    @IsArray()
    @IsNotEmpty({ message: 'O campo next_steps é obrigatório' })
    readonly next_steps: string[]

    @IsString()
    @IsNotEmpty({ message: 'O campo confidence é obrigatório' })
    readonly confidence: string
}