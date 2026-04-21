import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingType, OabState, Specialization } from 'generated/prisma/enums';

export class CreateLawyerDTO {
  @ApiProperty({
    example: 'Thiago Menezes',
    description: 'Nome completo do advogado',
  })
  @IsNotEmpty({ message: 'O campo fullName é obrigatório' })
  @IsString()
  readonly fullName: string;

  @ApiProperty({
    example: '123.456.789-00',
    description: 'CPF do advogado',
  })
  @IsNotEmpty({ message: 'O campo cpf é obrigatório' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/, {
    message: 'CPF deve estar no formato válido',
  })
  readonly cpf: string;

  @ApiProperty({
    example: '123456',
    description: 'Numero da OAB com 6 digitos',
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo oab_number é obrigatório' })
  @MinLength(6, { message: 'OabNumber precisa ter 6 dígitos' })
  @MaxLength(6, { message: 'OabNumber precisa ter 6 dígitos' })
  readonly oabNumber: string;

  @ApiProperty({
    enum: OabState,
    example: OabState.SP,
    description: 'UF da OAB',
  })
  @IsNotEmpty({ message: 'O campo oab_state é obrigatório' })
  @IsEnum(OabState)
  readonly oabState: OabState;

  @ApiProperty({
    enum: Specialization,
    example: Specialization.Tax,
    description: 'Especializacao juridica do advogado',
  })
  @IsEnum(Specialization)
  @IsNotEmpty()
  readonly specialization: Specialization;

  @ApiProperty({
    example: '11 99999-9999',
    description: 'Telefone do advogado',
  })
  @IsNotEmpty({ message: 'O campo phone é obrigatório' })
  @Matches(
    /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/,
    { message: 'Telefone deve estar no formato válido' },
  )
  @IsString()
  readonly phone: string;

  @ApiProperty({
    example: 'thiago@gmail.com',
    description: 'Email para login',
  })
  @IsEmail({}, { message: 'O email está inválido' })
  @IsNotEmpty({ message: 'O campo email é obrigatório' })
  readonly email: string;

  @ApiProperty({
    example: '@Za12345678',
    description: 'Senha forte com maiuscula, minuscula, numero e simbolo',
  })
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
  @IsNotEmpty({ message: 'O campo password é obrigatório' })
  readonly password: string;

  @ApiProperty({
    enum: BillingType,
    example: BillingType.Monthly,
    description: 'Tipo de cobranca do plano',
  })
  @IsEnum(BillingType, { message: 'Tipo de cobrança inválido' })
  @IsNotEmpty({ message: 'O campo billingType é obrigatório' })
  @IsString({ message: 'Tipo de cobrança inválido' })
  readonly billingType: BillingType;

  @ApiProperty({
    example: 'Plano Adv Premium',
    description: 'Nome do plano para assinatura',
  })
  @MinLength(1, { message: 'O campo namePlan deve ser preenchido' })
  @IsString({ message: 'Nome do plano é obrigatório' })
  readonly namePlan: string;
}
