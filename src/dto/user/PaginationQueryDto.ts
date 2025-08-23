// src/dto/PaginationQueryDto.ts
import { IsOptional, IsNumberString, Min } from "class-validator";

export class PaginationQueryDto {
  @IsOptional()
  @IsNumberString()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumberString()
  @Min(1)
  limit?: number = 10;
}
