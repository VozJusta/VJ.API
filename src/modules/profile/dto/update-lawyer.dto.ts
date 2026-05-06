import {
  IsEnum,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Specialization } from 'generated/prisma/enums';

export class UpdateLawyerDTO {
  @ApiPropertyOptional({
    example: 'Thiago Menezes',
    description: 'Nome completo do advogado',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  readonly fullName?: string;

  @ApiPropertyOptional({
    example: 'Advogado focado em direito tributário e empresarial.',
    description: 'Biografia resumida do advogado',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  readonly bio?: string;

  @ApiPropertyOptional({
    example: '123.456.789-00',
    description: 'CPF do advogado no formato com ou sem máscara',
  })
  @IsOptional()
  @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/)
  readonly cpf?: string;

  @ApiPropertyOptional({
    example: '12.345.678/0001-90',
    description: 'CNPJ do advogado no formato com ou sem máscara',
  })
  @IsOptional()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/0001\-\d{2}$|^\d{14}$/)
  readonly cnpj?: string;

  @ApiPropertyOptional({
    enum: Specialization,
    example: Specialization.Tax,
    description: 'Área de especialização jurídica do advogado',
  })
  @IsOptional()
  @IsEnum(Specialization)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  readonly specialization?: Specialization;

  @ApiPropertyOptional({
    example: 'Ativo',
    description: 'Status profissional exibido no perfil',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  readonly lawyerStatus?: string;

  @ApiPropertyOptional({
    example: '123456/SP',
    description: 'Número de inscrição na OAB',
  })
  @IsOptional()
  @Matches(/^\d{6,7}\/[A-Z]{2}$/)
  readonly oabNumber?: string;

  @ApiPropertyOptional({
    example: 'SP',
    description: 'UF da OAB',
  })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  readonly oabState?: string;

  @ApiPropertyOptional({
    example: '11 99999-9999',
    description: 'Telefone atualizado do advogado',
  })
  @IsOptional()
  @Matches(/^(?:\+55\s?)?\(?[1-9][0-9]\)?9?[\s-]?[2-9]\d{3}[\s-]?\d{4}$/)
  readonly phone?: string;

  @ApiPropertyOptional({
    example: 'thiago@gmail.com',
    description: 'Email atualizado do advogado',
  })
  @IsOptional()
  @IsEmail()
  readonly email?: string;
}
