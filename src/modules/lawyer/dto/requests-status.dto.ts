import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from 'generated/prisma/enums';

export class RequestsStatusDTO {
  @IsEnum(Status, { message: 'Status inválido' })
  @IsNotEmpty({ message: 'O status é obrigatório' })
  status: Status;
}
