import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../utils/types";
import { UserRepository } from "../repositories/UserRepositrory";
import { HttpStatus } from "../utils/constants";
import { GetIDParamDto } from "../dto/user/GetIdParamDto";
import { validate} from "class-validator";
import { validateErrorHandler } from "../utils/validationHandler";
import { PaginationQueryDto } from "../dto/user/PaginationQueryDto";

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  getUserById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const paramsDto = Object.assign(new GetIDParamDto(), req.params);
      const paramErrors = await validate(paramsDto);

      if (paramErrors.length > 0) {
        return validateErrorHandler(res, paramErrors);
      }

      const { id } = paramsDto;

      const user = await this.userRepository.findById(id);
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: "Пользователь не найден",
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: "Пользователь найден",
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const queryDto = Object.assign(new PaginationQueryDto(), req.query);
      const queryErrors = await validate(queryDto);

      if (queryErrors.length > 0) {
        return validateErrorHandler(res, queryErrors);
      }

      const { page = 1, limit = 10 } = queryDto;

      const result = await this.userRepository.findAll({ page, limit });

      res.status(HttpStatus.OK).json({
        message: "Список пользователей получен",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const paramsDto = Object.assign(new GetIDParamDto(), req.params);
      const paramErrors = await validate(paramsDto);

      if (paramErrors.length > 0) {
        return validateErrorHandler(res, paramErrors);
      }

      const { id } = paramsDto;

      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: "Пользователь не найден",
        });
        return;
      }

      const updatedUser = await this.userRepository.updateBlockUser(id, true);

      res.status(HttpStatus.OK).json({
        message: "Пользователь заблокирован",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };
  unblockUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const paramsDto = Object.assign(new GetIDParamDto(), req.params);
      const paramErrors = await validate(paramsDto);

      if (paramErrors.length > 0) {
        return validateErrorHandler(res, paramErrors);
      }

      const { id } = paramsDto;
      const user = await this.userRepository.findById(id);

      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: "Пользователь не найден",
        });
        return;
      }

      const updatedUser = await this.userRepository.updateBlockUser(id, false);

      res.status(HttpStatus.OK).json({
        message: "Пользователь разблокирован",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
