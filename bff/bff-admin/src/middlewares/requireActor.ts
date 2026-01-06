import { Request, Response, NextFunction } from 'express';
export const requireActor = (...allowedActors: string[]) => (req: Request, res: Response, next: NextFunction): void => {
  const actor = (req as any).context?.user?.actor;  
    if (!actor || !actor.type) {
        res.status(401).json({ 
            success: false,
            error: 'UNAUTHORIZED',
            message: 'User actor information is missing'
        });
        return;
    }
    if (!allowedActors.includes(actor.type)) {
        res.status(403).json({ 
            success: false,
            error: 'FORBIDDEN',
            message: `This endpoint requires one of the following actor types: ${allowedActors.join(', ')}`
        });
        return;
    }

    next();
};

// this is to prevent specific Actor type
export const preventActor = (...forbiddenActors: string[]) => (req: Request, res: Response, next: NextFunction): void => {
  const actor = (req as any).context?.user?.actor;
    if (!actor || !actor.type) {
        res.status(401).json({ 
            success: false,
            error: 'Unauthorized to access this endpoint',
            message: 'User actor information is missing'
        });
        return;
    }
    if (forbiddenActors.includes(actor.type)) {
        res.status(403).json({ 
            success: false,
            error: `Forbidden to access this endpoint for actor of this type: ${actor.type}`,
            message: `This endpoint forbids the following actor types: ${forbiddenActors.join(', ')}`
        });
        return;
    }
}