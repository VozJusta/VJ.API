import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, Min, MinLength } from "class-validator"
import { OabState, Specialization } from "generated/prisma/enums"

export class CreateLawyerDTO {
    @IsNotEmpty({ message: 'O campo fullName é obrigatório' })
    @IsString()
    readonly fullName: string

    @IsNotEmpty({ message: 'O campo cpf é obrigatório' })
    @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/, {
        message: 'CPF deve estar no formato válido'
    })
    readonly cpf: string

    @IsString()
    @IsNotEmpty({ message: 'O campo oab_number é obrigatório' })
    @MinLength(4, { message: 'OabNumber precisa ter 6 digítos ' })
    @MaxLength(6, { message: 'OabNumber precisa ter 6 digítos ' })
    readonly oabNumber: string

    @IsNotEmpty({ message: 'O campo oab_state é obrigatório'})
    @IsEnum(OabState)
    readonly oabState: OabState

    @IsEnum(Specialization)
    @IsNotEmpty()
    readonly specialization: Specialization

    @IsNotEmpty({ message: 'O campo phone é obrigatório' }) 
    @IsString()
    readonly phone: string

    @IsEmail({}, { message: 'O email está inválido' })
    @IsNotEmpty({ message: 'O campo email é obrigatório' })
    readonly email: string

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