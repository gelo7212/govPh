import { Request, Response, NextFunction } from 'express';
export const requireActor = (...allowedActors: string[]) => (req: Request, res: Response, next: NextFunction): void => {
  const actor = (req as any).context?.user?.actor;  
    if (!actor || !actor.type) {
        res.status(401).json({ 
            success: false,
            error: 'UNAUTHORIZED',
            message: 'User actor information is missing [RequireActor]'
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
  const context = (req as any).context;
  const actor = context?.user?.actor;
  
  console.log('PreventActor Middleware - Actor:', actor);
  console.log('PreventActor Middleware - Forbidden Actors:', forbiddenActors);
  
  if (!actor || !actor.type) {
    res.status(401).json({ 
      success: false,
      error: 'UNAUTHORIZED',
      message: 'User actor information is missing. [PreventActor]'
    });
    return;
  }
  
  if (forbiddenActors.includes(actor.type)) {
    res.status(403).json({ 
      success: false,
      error: 'FORBIDDEN',
      message: `This endpoint forbids the following actor types: ${forbiddenActors.join(', ')}`
    });
    return;
  }
  
  next();
}