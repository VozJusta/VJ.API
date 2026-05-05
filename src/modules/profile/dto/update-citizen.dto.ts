import {
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCitizenDTO {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  readonly fullName?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/)
  readonly cpf?: string;

  @IsOptional()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/0001\-\d{2}$|^\d{14}$/)
  readonly cnpj?: string;

  @IsOptional()
  @Matches(/^(?:\+55\s?)?\(?[1-9][0-9]\)?9?[\s-]?[2-9]\d{3}[\s-]?\d{4}$/)
  readonly phone?: string;
}
