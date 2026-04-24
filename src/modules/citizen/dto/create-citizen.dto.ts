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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingType } from 'generated/prisma/enums';

export class CreateCitizenDTO {
  @ApiProperty({
    example: 'Pedro Sales',
    description: 'Nome completo do cidadao',
  })
  @IsNotEmpty({ message: 'O campo fullName é obrigatório' })
  @IsString()
  readonly fullName: string;

  @ApiProperty({
    example: '123.456.789-00',
    description: 'CPF do cidadao',
  })
  @IsNotEmpty({ message: 'o campo cpf é obrigatório' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/, {
    message: 'CPF deve estar no formato válido',
  })
  readonly cpf: string;

  @ApiPropertyOptional({
    example: '12.345.678/0001-90',
    description: 'CNPJ opcional para conta PJ',
  })
  @IsOptional()
  readonly cnpj: string;

  @ApiProperty({
    example: '11 99999-9999',
    description: 'Telefone do cidadao',
  })
  @IsNotEmpty({ message: 'Campo phone é obrigatório' })
  @Matches(
    /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/,
    { message: 'Telefone deve estar no formato válido' },
  )
  @IsString()
  readonly phone: string;

  @ApiProperty({
    example: 'pedro@gmail.com',
    description: 'Email para login',
  })
  @IsNotEmpty({ message: 'Campo email é obrigatório' })
  @IsEmail({}, { message: 'Informe um email válido' })
  readonly email: string;

  @ApiProperty({
    example: '@Za12345678',
    description: 'Senha forte com maiuscula, minuscula, numero e simbolo',
  })
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

  @ApiProperty({
    enum: BillingType,
    example: BillingType.Monthly,
    description: 'Tipo de cobranca do plano',
  })
  @IsEnum(BillingType, { message: 'Tipo de cobrança inválido' })
  @IsString({ message: 'Tipo de cobrança inválido' })
  readonly billingType: BillingType;

  @ApiProperty({
    example: 'Plano Inicial',
    description: 'Nome do plano para assinatura',
  })
  @IsString({ message: 'Nome do plano é obrigatório' })
  readonly namePlan: string;
}
