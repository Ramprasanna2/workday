// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';

// Example user is attached to req.user after authentication
// req.user = { id: string, role: 'Employee' | 'Manager' | 'Admin' }

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }

    next();
  };
};

// Middleware to allow employees to act only on their own resource
export const ownResource = (paramIdName: string) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.user.role === 'Employee' && req.user.id !== req.params[paramIdName]) {
      return res.status(403).json({ message: 'Forbidden: Not your resource' });
    }

    next();
  };
};
