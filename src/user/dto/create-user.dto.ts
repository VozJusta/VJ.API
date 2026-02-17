import { IsBoolean, IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches } from "class-validator"

export class CreateUserDTO {
    @IsNotEmpty({ message: 'O campo fullName é obrigatório' })
    @IsString()
    readonly fullName: string

    @IsNotEmpty({ message: 'o campo cpf é obrigatório' })
    @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/, {
        message: 'CPF deve estar no formato válido',
    })
    readonly cpf: string

    @IsNotEmpty({ message: 'Campo phone é obrigatório' })
    readonly phone: string

    @IsNotEmpty({ message: 'Campo email é obrigatório' })
    @IsEmail({}, {  message: 'Informe um email válido' })
    readonly email: string

    @IsNotEmpty({ message: 'Campo password é obrigatório' })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1
    }, { message: 'Senha com formato inválido'})
    readonly password: string
}