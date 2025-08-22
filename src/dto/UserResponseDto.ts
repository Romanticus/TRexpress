import { UserRole } from '../entities/User.entity';

export class UserResponseDto {
  id: string;
  fullName: string;
  birthDate: Date;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.fullName = user.fullName;
    this.birthDate = user.birthDate;
    this.email = user.email;
    this.role = user.role;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

export class UserListResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(data: any) {
    this.users = data.users.map((user: any) => new UserResponseDto(user));
    this.total = data.total;
    this.page = data.page;
    this.limit = data.limit;
    this.totalPages = data.totalPages;
  }
}