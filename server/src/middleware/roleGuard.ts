import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { ApiError } from '../utils/ApiError';

export const roleGuard = (...allowedRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(`Access restricted to: ${allowedRoles.join(', ')}`);
    }

    next();
  };
};
