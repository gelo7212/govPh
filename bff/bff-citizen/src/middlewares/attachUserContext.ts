import { Request, Response, NextFunction } from 'express';
import { UserContext } from '@gov-ph/bff-core';

/**
 * Middleware factory to attach user context to a service client before each request
 */
export function createAttachUserContextMiddleware(serviceClient: any) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userContext: UserContext = {
      userId: req.context?.user?.id,
      role: req.context?.user?.role,
      cityId: req.context?.user?.actor?.cityCode,
      requestId: req.context?.requestId,
      actorType: req.context?.user?.actor?.type,
    };

    serviceClient.setUserContext(userContext);
    next();
  };
}
