import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';
import { BillingType } from 'generated/prisma/enums';

export class CreateUserDTO {
  @IsNotEmpty({ message: 'O campo fullName é obrigatório' })
  @IsString()
  readonly fullName: string;

  @IsNotEmpty({ message: 'o campo cpf é obrigatório' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/, {
    message: 'CPF deve estar no formato válido',
  })
  readonly cpf: string;

  @IsOptional()
  readonly cnpj: string;

  @IsNotEmpty({ message: 'Campo phone é obrigatório' })
  @Matches(
    /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/,
    { message: 'Telefone deve estar no formato válido' },
  )
  @IsString()
  readonly phone: string;

  @IsNotEmpty({ message: 'Campo email é obrigatório' })
  @IsEmail({}, { message: 'Informe um email válido' })
  readonly email: string;

  @IsNotEmpty({ message: 'Campo password é obrigatório' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    },
    { message: 'Senha com formato inválido' },
  )
  readonly password: string;

  @IsEnum(BillingType, { message: 'Tipo de cobrança inválido' })
  @IsString({ message: 'Tipo de cobrança inválido' })
  readonly billingType: BillingType;

  @IsString({ message: 'Nome do plano é obrigatório' })
  readonly namePlan: string;
}
