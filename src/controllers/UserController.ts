import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepositrory";
import { CreateUserDto } from "../dto/CreateUserDto";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  BCRYPT_SALT_ROUNDS,
  JWT_REFRESH_EXPIRES_IN,
  JWT_ACCESS_EXPIRES_IN,
} from "../utils/constants";
import { v4 as uuidv4 } from "uuid";


export class UserController {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }


  async register(registerDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      BCRYPT_SALT_ROUNDS
    );

    const id = uuidv4();
    const tokens = await this._getTokens({
      id,
      email: registerDto.email,
    });

    const hashedRefreshToken = await bcrypt.hash(
      tokens.refreshToken,
      BCRYPT_SALT_ROUNDS
    );
    const newUser = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      id,
      refreshToken: hashedRefreshToken,
    });
    return {
      message: "Регистрация прошла успешно",
      user: newUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async _getTokens(user: { id: string; email: string; role?: string }) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role || "user",
    };

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}

export const userController = new UserController();
