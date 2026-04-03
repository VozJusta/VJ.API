import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Specialization } from "generated/prisma/enums";

export class IngestionDTO {
    @IsOptional()
    @IsString()
    readonly id?: string;

    @IsNotEmpty({ message: 'Campo content é obrigatório' })
    @ApiProperty({ example: 'De acordo com o Artigo 477 da Consolidação das Leis do Trabalho (CLT), o empregador é obrigado a efetuar'})
    @IsString()
    readonly content: string

    @IsNotEmpty({ message: 'Campo source é obrigatório' })
    @IsString()
    @ApiProperty({ example: 'CLT - Decreto-Lei nº 5.452/1943' })
    readonly source: string

    @IsNotEmpty({ message: 'Campo title é obrigatório' })
    @IsString()
    @ApiProperty({ example: 'Art. 477 da CLT - Prazo para pagamento das verbas rescisórias' })
    readonly title: string;

    @IsEnum(Specialization)
    @IsNotEmpty({ message: 'Campo area é obrigatório' })
    @ApiProperty({ example: 'Labor_and_employment' })  
    readonly area: Specialization
}