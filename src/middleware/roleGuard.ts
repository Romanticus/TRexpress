import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/User.entity';

export class RoleGuard {
  /**
   * Require admin role
   */
  static requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      if (user.role !== UserRole.ADMIN) {
        res.status(403).json({ 
          message: 'Access denied. Admin role required.',
          requiredRole: UserRole.ADMIN,
          userRole: user.role
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role guard error:', error);
      res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };

  /**
   * Require user role (or admin)
   */
  static requireUser = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      if (user.role !== UserRole.USER && user.role !== UserRole.ADMIN) {
        res.status(403).json({ 
          message: 'Access denied. User role required.',
          requiredRole: 'user or admin',
          userRole: user.role
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role guard error:', error);
      res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };

  /**
   * Allow access to resource owner or admin
   * Checks if user is accessing their own resource or is an admin
   */
  static requireOwnerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;
      const resourceUserId = req.params.id;

      if (!user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      if (!resourceUserId) {
        res.status(400).json({ message: 'Resource ID is required' });
        return;
      }

      // Admin can access any resource
      if (user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // User can only access their own resources
      if (user.userId !== resourceUserId) {
        res.status(403).json({ 
          message: 'Access denied. You can only access your own resources.',
          userId: user.userId,
          requestedUserId: resourceUserId
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role guard error:', error);
      res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };

  /**
   * Allow specific roles
   */
  static requireRoles = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const user = req.user;

        if (!user) {
          res.status(401).json({ message: 'Authentication required' });
          return;
        }

        if (!allowedRoles.includes(user.role)) {
          res.status(403).json({ 
            message: 'Access denied. Insufficient permissions.',
            requiredRoles: allowedRoles,
            userRole: user.role
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Role guard error:', error);
        res.status(500).json({ message: 'Internal server error during authorization' });
      }
    };
  };

  /**
   * Require active user account
   * This should be used after authentication middleware
   */
  static requireActiveAccount = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // Note: isActive check is already done in auth middleware,
      // but this can be used for additional verification
      next();
    } catch (error) {
      console.error('Role guard error:', error);
      res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };

  /**
   * Block access for specific user (e.g., banned users)
   * Usage: RoleGuard.blockUser(['banned-user-id'])
   */
  static blockUsers = (blockedUserIds: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const user = req.user;

        if (!user) {
          res.status(401).json({ message: 'Authentication required' });
          return;
        }

        if (blockedUserIds.includes(user.userId)) {
          res.status(403).json({ 
            message: 'Access denied. Your account has restricted access to this resource.',
            userId: user.userId
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Role guard error:', error);
        res.status(500).json({ message: 'Internal server error during authorization' });
      }
    };
  };
}

// Export convenience functions
export const requireAdmin = RoleGuard.requireAdmin;
export const requireUser = RoleGuard.requireUser;
export const requireOwnerOrAdmin = RoleGuard.requireOwnerOrAdmin;
export const requireRoles = RoleGuard.requireRoles;
export const requireActiveAccount = RoleGuard.requireActiveAccount;
export const blockUsers = RoleGuard.blockUsers;