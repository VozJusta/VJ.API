import { IsEmail, IsNotEmpty } from "class-validator";

export class SendCodeEmailDTO {

    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Campo email obrigatório' })
    readonly email: string
}