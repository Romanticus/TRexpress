import { Request, response, Response } from "express";
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
  HttpStatus,
} from "../utils/constants";
import { v4 as uuidv4 } from "uuid";
import { validate } from "class-validator";
import { QueryFailedError } from "typeorm";


export class UserController {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try{
    const registerDto = Object.assign(new CreateUserDto(), req.body);

    const errors = await validate(registerDto);
    if (errors.length > 0) {
      res.status(400).json({
        message: "Validation failed",
        errors: errors
          .map((error) => Object.values(error.constraints || {}))
          .flat(),
      });
      return;
    }

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

    const { password, ...newUserWithoutPassword } = newUser;

      res.status(HttpStatus.CREATED).json({
        message: "Регистрация прошла успешно",
        user: newUserWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (exception) {
        if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      exception.code === '23505'
    ) {
      const driverError = (exception as unknown as QueryFailedError)
        .driverError as {
        detail?: string;
        table?: string;
      };

      const detail = driverError?.detail ?? '';
      const table = driverError?.table ?? 'Entity';
      const match = detail.match(/\((.+?)\)=\((.+?)\)/);
      const field = match?.[1];
      const value = match?.[2];

      const message =
        field && value
          ? `${table} с таким ${field} ${value} уже существует`
          : `${table} с таким уникальным значением уже существует`;

     res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message,
      });
        return;
      }
      
      
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: 'Внутренняя ошибка сервера' 
      });
  }}

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
