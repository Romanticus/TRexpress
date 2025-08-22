
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../utils/constants';
import { JwtPayload, UserRole } from '../utils/types';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Необходима авторизация'
    });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'Доступ запрещен. Требуются права администратора'
    });
  }

  next();
};


export const requireSelfOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Необходима авторизация'
    });
  }

  const userId = req.params.id;
  const isOwner = req.user.userId === userId;
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'Доступ запрещен. Вы можете получить доступ только к своим данным'
    });
  }

  next();
};