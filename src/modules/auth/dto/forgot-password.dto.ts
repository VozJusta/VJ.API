import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDTO {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Campo email obrigatório' })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: 'Campo new_password obrigatório' })
  @IsStrongPassword({
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minLowercase: 1,
  })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  readonly new_password: string;
}
