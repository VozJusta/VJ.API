import { IsDecimal, IsNotEmpty, IsString, MinLength } from 'class-validator';

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

  @IsString()
  @IsNotEmpty({ message: 'O campo currency é obrigatório' })
  readonly interval: 'month' | 'year';
}
