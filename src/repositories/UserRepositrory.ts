import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User.entity";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      select: [
        "id",
        "fullName",
        "birthDate",
        "email",
        "role",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  /**
   * Найти пользователя по айди, с паролем (для авторизации)
   */
  async findByIdWithPassword(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
      select: [
        "id",
        "fullName",
        "birthDate",
        "email",
        "role",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
    });
  }

  async findAll(options: PaginationOptions = {}): Promise<UserListResponse> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await this.repository.findAndCount({
      select: [
        "id",
        "fullName",
        "birthDate",
        "email",
        "role",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
      skip,
      take: limit,
      order: {
        createdAt: "DESC",
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User | null> {
    await this.repository.update(id, { isActive });
    return await this.findById(id);
  }
}
