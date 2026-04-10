import { IsEnum, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";
import { OabState, Specialization } from "generated/prisma/enums";

export class CompleteLawyerRegisterDTO {
    @IsNotEmpty({ message: 'o campo cpf é obrigatório' })
    @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/, {
        message: 'CPF deve estar no formato válido',
    })
    readonly cpf: string

    @IsString()
    @IsNotEmpty({ message: 'O campo oab_number é obrigatório' })
    @MinLength(6, { message: 'OabNumber precisa ter 6 dígitos' })
    @MaxLength(6, { message: 'OabNumber precisa ter 6 dígitos' })
    readonly oabNumber: string

    @IsNotEmpty({ message: 'O campo oab_state é obrigatório' })
    @IsEnum(OabState)
    readonly oabState: OabState

    @IsEnum(Specialization)
    @IsNotEmpty()
    readonly specialization: Specialization

    @IsNotEmpty({ message: 'O campo phone é obrigatório' })
    @Matches(/^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/,
        { message: 'Telefone deve estar no formato válido' })
    @IsString()
    readonly phone: string

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1
    }, { message: 'Senha com formato inválido' })
    @IsNotEmpty({ message: 'O campo password é obrigatório' })
    readonly password: string
}