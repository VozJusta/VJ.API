import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyForgotCodeDTO {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Campo email obrigatório' })
  readonly email: string;

  @IsNotEmpty({ message: 'Campo code obrigatório' })
  readonly code: string;
}