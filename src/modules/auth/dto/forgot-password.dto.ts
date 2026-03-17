import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDTO {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Campo email obrigatório' })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: 'Campo new_password obrigatório' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  readonly new_password: string;
}
