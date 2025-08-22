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
import { JwtPayload } from "../utils/types";
import { error } from "console";
import { LoginDto } from "../dto/LoginDto";
import { User } from "../entities/User.entity";


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
      res.status(HttpStatus.BAD_REQUEST).json({
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

    login = async (req: Request, res: Response): Promise<void> => {
    try{
         const loginDto:LoginDto = Object.assign(new LoginDto(), req.body);

    const errors = await validate(loginDto);
    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: "Validation failed",
        errors: errors
          .map((error) => Object.values(error.constraints || {}))
          .flat(),
      });
      return;
    }

    const user = await this.userRepository.findByEmailWithPassword(loginDto.email);
    if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: "Пользователь не найден",
        });
        return;
      }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    
    if (!passwordMatch) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          message: "Неверный email или пароль",
        });
        return;
    }
    const tokens = await this.refresh(user)


    const { password, refreshToken, ...userWithoutPassword } = user;
    
    res.status(HttpStatus.OK).json({
      message: "Авторизация успешна",
      user: userWithoutPassword,
      ...tokens
    });



    }
    catch{ (error)

    }
    
    
    }

  refresh = async (user:User ): Promise<any> => {
    const tokens = await this._getTokens(user);
    const hashedRefreshToken = await bcrypt.hash(
      tokens.refreshToken,
      BCRYPT_SALT_ROUNDS,
    );
    const updatedUser = await this.userRepository.updateUser(
      user.id,
      {refreshToken: hashedRefreshToken }
    );
    return {
      accessToken: tokens.accessToken,
      refreshToken: hashedRefreshToken,
      
    };
  }

  async _getTokens(user: { id: string; email: string; role?: string }) {
    const payload: JwtPayload = {
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
