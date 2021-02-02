import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || "secret";

export interface RequestWithUser extends Request {
  user?: { userId: string };
}

export const requiredAuthMiddleware = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader?.startsWith("Bearer ")) {
    res.sendStatus(401);
    return;
  }

  const token = authorizationHeader.split(" ")[1];
  try {
    const tokenData = jwt.verify(token, PRIVATE_KEY) as {
      userId: string;
      username: string;
    };
    // const userData = await UsersRepository.getById(tokenData.userId);
    // req.user = userData;
    req.user = { userId: tokenData.userId };
    next();
  } catch (error) {
    res.sendStatus(401);
  }
};

export const optionalAuthMiddleware = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  const authorizationHeader = req.headers.authorization;
  if (!!authorizationHeader && !!authorizationHeader?.startsWith("Bearer ")) {
    const token = authorizationHeader.split(" ")[1];

    try {
      const tokenData = jwt.verify(token, PRIVATE_KEY) as {
        userId: string;
        username: string;
      };
      // const userData = await UsersRepository.getById(tokenData.userId);
      // req.user = userData;
      req.user = { userId: tokenData.userId };
    } catch (error) {
      next();
    }
  }

  next();
};
