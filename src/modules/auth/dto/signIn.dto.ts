import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class SignInDTO {

    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Campo email obrigatório' })
    readonly email: string

    @IsString()
    @IsNotEmpty({ message: 'Campo password obrigatório' })
    readonly password: string
}