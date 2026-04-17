import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, Min, MinLength } from "class-validator"
import { BillingType, OabState, Specialization } from "generated/prisma/enums"

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

    @IsEnum(BillingType, { message: 'Tipo de cobrança inválido' })
    @IsString({ message: 'Tipo de cobrança inválido' })
    readonly billingType: BillingType;

    @IsString({ message: 'Nome do plano é obrigatório' })
    readonly namePlan: string;
}