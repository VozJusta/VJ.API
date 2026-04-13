import { IsNotEmpty, IsStrongPassword } from "class-validator"

export class ChangePasswordDTO {

    @IsNotEmpty({ message: 'O campo currentPassword é obrigatório' })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1
    }, { message: 'Senha com formato inválido' })
    currentPassword: string

    @IsNotEmpty({ message: 'O campo currentPassword é obrigatório' })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1
    }, { message: 'Senha com formato inválido' })
    newPassword: string
}