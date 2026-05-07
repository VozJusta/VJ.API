import {
  Injectable,
  PipeTransform,
  BadRequestException,
  Inject,
  Scope,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { UpdateCitizenDTO } from '@m/profile/dto/update-citizen.dto';
import { UpdateLawyerDTO } from '@m/profile/dto/update-lawyer.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

interface ValidationErrorResponse {
  field: string;
  message: string;
}

@Injectable({ scope: Scope.REQUEST })
export class ValidateUpdateProfilePipe implements PipeTransform {
  constructor(@Inject(REQUEST) private request: Request & { user?: any }) {}

  private getFieldErrorMessage(field: string, constraints: Record<string, string>): string {
    const constraintType = Object.keys(constraints)[0];

    const fieldMessages: Record<string, Record<string, string>> = {
      email: {
        isEmail: 'Email deve ser válido (ex: seu.email@example.com)',
      },
      phone: {
        matches: 'Telefone inválido. Use: (11) 91336-2815 ou (11) 9 1336-2815 ou +55 11 91336-2815',
      },
      cpf: {
        matches: 'CPF deve ser: 123.456.789-00 ou 12345678900',
      },
      cnpj: {
        matches: 'CNPJ deve ser: 12.345.678/0001-90 ou 12345678000190',
      },
      oabNumber: {
        matches: 'OAB deve ser: 123456/SP (números/estado)',
      },
      oabState: {
        matches: 'Estado OAB deve ser 2 letras maiúsculas: SP, RJ, MG',
      },
      fullName: {
        isString: 'Nome deve ser texto',
        minLength: 'Nome deve ter no mínimo 3 caracteres',
        maxLength: 'Nome não pode ter mais de 100 caracteres',
      },
      bio: {
        isString: 'Biografia deve ser texto',
        maxLength: 'Biografia não pode ter mais de 500 caracteres',
      },
      lawyerStatus: {
        isString: 'Status deve ser texto',
        maxLength: 'Status não pode ter mais de 50 caracteres',
      },
      specialization: {
        isEnum: 'Especialização inválida',
      },
    };

    if (fieldMessages[field]?.[constraintType]) {
      return fieldMessages[field][constraintType];
    }

    // Fallback para tipos comuns
    if (constraintType === 'isString') return 'Este campo deve ser texto';
    if (constraintType === 'isNumber') return 'Este campo deve ser número';
    if (constraintType === 'isOptional') return 'Campo inválido';
    if (constraintType === 'isEnum') return 'Valor não é permitido para este campo';
    if (constraintType === 'minLength') {
      const minLength = constraints[constraintType].match(/\d+/)?.[0];
      return `Mínimo ${minLength} caracteres`;
    }
    if (constraintType === 'maxLength') {
      const maxLength = constraints[constraintType].match(/\d+/)?.[0];
      return `Máximo ${maxLength} caracteres`;
    }
    if (constraintType === 'forbiddenNonWhitelisted') {
      return 'Este campo não é permitido';
    }

    return Object.values(constraints)[0];
  }

  async transform(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException('Corpo da requisição inválido');
    }

    const role = this.request.user?.role?.toLowerCase?.() ?? '';

    let dtoClass: typeof UpdateCitizenDTO | typeof UpdateLawyerDTO;

    if (role === 'citizen') {
      dtoClass = UpdateCitizenDTO;
    } else if (role === 'lawyer') {
      dtoClass = UpdateLawyerDTO;
    } else {
      throw new BadRequestException('Role inválida para atualizar perfil');
    }

    const instance = plainToInstance(dtoClass, value, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
    });

    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
    });

    if (errors.length > 0) {
      const errorResponse: ValidationErrorResponse[] = errors.map(
        (error: ValidationError) => ({
          field: error.property,
          message: this.getFieldErrorMessage(error.property, error.constraints || {}),
        }),
      );

      throw new BadRequestException({
        message: 'Há erros na validação dos dados',
        errors: errorResponse,
      });
    }

    return instance;
  }
}
