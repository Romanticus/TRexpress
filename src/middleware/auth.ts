import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepositrory';
import { UserRole } from '../entities/User.entity';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export class AuthMiddleware {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Verify JWT token and authenticate user
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ message: 'Authorization header is required' });
        return;
      }

      // Check if token starts with 'Bearer '
      if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authorization header must start with Bearer' });
        return;
      }

      // Extract token
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      if (!token) {
        res.status(401).json({ message: 'Token is required' });
        return;
      }

      // Verify token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET environment variable is not set');
        res.status(500).json({ message: 'Server configuration error' });
        return;
      }

      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      } catch (jwtError) {
        if (jwtError instanceof jwt.TokenExpiredError) {
          res.status(401).json({ message: 'Token has expired' });
          return;
        } else if (jwtError instanceof jwt.JsonWebTokenError) {
          res.status(401).json({ message: 'Invalid token' });
          return;
        } else {
          res.status(401).json({ message: 'Token verification failed' });
          return;
        }
      }

      // Validate token payload
      if (!decoded.userId || !decoded.email || !decoded.role) {
        res.status(401).json({ message: 'Invalid token payload' });
        return;
      }

      // Check if user still exists and is active
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ message: 'Account is blocked' });
        return;
      }

      // Verify email matches (in case user changed email)
      if (user.email !== decoded.email) {
        res.status(401).json({ message: 'Token is no longer valid' });
        return;
      }

      // Add user info to request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ message: 'Internal server error during authentication' });
    }
  };

  /**
   * Optional authentication - doesn't fail if no token provided
   * Useful for endpoints that work for both authenticated and anonymous users
   */

}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();