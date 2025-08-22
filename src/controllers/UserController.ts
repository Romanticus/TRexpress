import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../utils/types";
import { UserRepository } from "../repositories/UserRepositrory";
import { HttpStatus } from "../utils/constants";

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
      const { id } = req.params;

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

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
        
      const { id } = req.params;
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
      const { id } = req.params;
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
