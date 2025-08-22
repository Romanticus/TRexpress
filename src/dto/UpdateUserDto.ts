import { IsEmail, IsOptional, IsDateString, MinLength, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from '../entities/User.entity';

export class UpdateUserDto {
  @IsOptional()
  fullName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}