import { IsEnum, IsOptional } from 'class-validator';
import { Status } from 'generated/prisma/enums';

export class RequestsStatusDTO {
  @IsOptional()
  @IsEnum(Status, { message: 'Status inválido' })
  status: Status;
}
