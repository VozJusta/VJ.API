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
import { Specialization } from 'generated/prisma/enums';

export class UpdateLawyerDTO {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  readonly fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  readonly bio?: string;

  @IsOptional()
  @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/)
  readonly cpf?: string;

  @IsOptional()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/0001\-\d{2}$|^\d{14}$/)
  readonly cnpj?: string;

  @IsOptional()
  @IsEnum(Specialization)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  readonly specialization?: Specialization;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  readonly lawyerStatus?: string;

  @IsOptional()
  @Matches(/^\d{6,7}\/[A-Z]{2}$/)
  readonly oabNumber?: string;

  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  readonly oabState?: string;

  @IsOptional()
  @Matches(/^(?:\+55\s?)?\(?[1-9][0-9]\)?9?[\s-]?[2-9]\d{3}[\s-]?\d{4}$/)
  readonly phone?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;
}
