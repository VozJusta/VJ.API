import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { BillingType, PlanType } from 'generated/prisma/client';

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty({ message: 'O campo productName é obrigatório' })
  @MinLength(5, { message: 'O campo productName precisa ter 5 caracteres' })
  readonly productName: string;

  @IsString()
  readonly description: string;

  @IsDecimal(
    { decimal_digits: '2' },
    {
      message: 'O campo amount deve ser um número decimal com 2 casas decimais',
    },
  )
  readonly amount: number;

  @IsEnum(BillingType, { message: 'Tipo de cobrança inválido' })
  @IsString({ message: 'Tipo de cobrança inválido' })
  readonly interval: BillingType;

  @IsEnum(PlanType, { message: 'Tipo de plano inválido' })
  @IsString({ message: 'Tipo de plano inválido' })
  readonly planType: PlanType;
}
