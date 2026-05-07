import {
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCitizenDTO {
  @ApiPropertyOptional({
    example: 'Pedro Sales',
    description: 'Nome completo do cidadão',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  readonly fullName?: string;

  @ApiPropertyOptional({
    example: 'pedro@gmail.com',
    description: 'Email atualizado do cidadão',
  })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional({
    example: '123.456.789-00',
    description: 'CPF do cidadão no formato com ou sem máscara',
  })
  @IsOptional()
  @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/)
  readonly cpf?: string;

  @ApiPropertyOptional({
    example: '12.345.678/0001-90',
    description: 'CNPJ do cidadão no formato com ou sem máscara',
  })
  @IsOptional()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/0001\-\d{2}$|^\d{14}$/)
  readonly cnpj?: string;

  @ApiPropertyOptional({
    example: '(11) 9 1336-2815',
    description: 'Telefone atualizado do cidadão. Formatos aceitos: (11) 91336-2815, (11) 9 1336-2815, 11 91336-2815, +55 11 91336-2815',
  })
  @IsOptional()
  @Matches(/^(?:\+55\s?)?\(?[1-9][0-9]\)?[\s-]?(?:9[\s-]?\d{4}[\s-]?\d{4}|\d{4}[\s-]?\d{4})$/)
  readonly phone?: string;
}
