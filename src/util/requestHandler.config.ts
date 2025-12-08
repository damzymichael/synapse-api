import {Request, Response, NextFunction} from 'express';

export type CustomRequestHandler<T = any> = (
  req: Request,
  res: Response,
  next?: NextFunction,
  ...rest: T[]
) => Promise<void | Response>;

export const asyncWrapper = (fn: CustomRequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/* Request params, {}, Request body, Request query */

export const Controller = <T extends {[K in keyof T]: CustomRequestHandler}>(
  controllers: T
) => {
  for (let key of Object.keys(controllers)) {
    controllers[key] = asyncWrapper(controllers[key]);
  }
  return controllers;
};
