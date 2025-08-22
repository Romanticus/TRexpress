import { IsUUID } from 'class-validator';

export class GetIDParamDto {
  @IsUUID()
  id: string;
}