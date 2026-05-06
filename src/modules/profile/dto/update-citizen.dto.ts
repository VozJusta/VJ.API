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
    example: '11 99999-9999',
    description: 'Telefone atualizado do cidadão',
  })
  @IsOptional()
  @Matches(/^(?:\+55\s?)?\(?[1-9][0-9]\)?9?[\s-]?[2-9]\d{3}[\s-]?\d{4}$/)
  readonly phone?: string;
}
