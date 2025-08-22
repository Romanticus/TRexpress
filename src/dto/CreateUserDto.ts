
import { IsEmail, IsNotEmpty, MinLength, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  fullName: string;

  @IsDateString()
  birthDate: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
