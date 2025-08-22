import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepositrory";
import { CreateUserDto } from "../dto/auth/CreateUserDto";
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
import { JwtPayload, UserRole } from "../utils/types";
import { LoginDto } from "../dto/auth/LoginDto";
import { User } from "../entities/User.entity";
import { validateErrorHandler } from "../utils/validationhandler";

export class AuthController {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const registerDto = Object.assign(new CreateUserDto(), req.body);

      const errors = await validate(registerDto);
      if (errors.length > 0) {return validateErrorHandler(res,errors)}

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
    } catch (err) {
      return next(err);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const loginDto: LoginDto = Object.assign(new LoginDto(), req.body);

      const errors = await validate(loginDto);
      if (errors.length > 0) { return validateErrorHandler(res,errors)}

      const user = await this.userRepository.findByEmailWithPassword(
        loginDto.email
      );
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: "Пользователь не найден",
        });
        return;
      }

      const passwordMatch = await bcrypt.compare(
        loginDto.password,
        user.password
      );

      if (!passwordMatch) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          message: "Неверный email или пароль",
        });
        return;
      }

        if (user.isBlocked ) {
        res.status(HttpStatus.FORBIDDEN).json({
          message: "Доступ заблокирован",
        });
        return;
      }

      const tokens = await this.refresh(user);

      const { password, refreshToken, ...userWithoutPassword } = user;

      res.status(HttpStatus.OK).json({
        message: "Авторизация успешна",
        user: userWithoutPassword,
        ...tokens,
      });
    } catch (error) {
      return next(error);
    }
  };

  refresh = async (user: User): Promise<any> => {
    const tokens = await this._getTokens(user);
    const hashedRefreshToken = await bcrypt.hash(
      tokens.refreshToken,
      BCRYPT_SALT_ROUNDS
    );
    const updatedUser = await this.userRepository.updateUser(user.id, {
      refreshToken: hashedRefreshToken,
    });
    return {
      accessToken: tokens.accessToken,
      refreshToken: hashedRefreshToken,
    };
  };

  async _getTokens(user: { id: string; email: string; role?: string }) {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || UserRole.USER,
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

export const authController = new AuthController();
