import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { HttpStatus, JWT_ACCESS_SECRET } from "../utils/constants";

interface SessionRequest extends Request {
  user?: string | JwtPayload;
}

const handleAuthError = (res: Response) => {
  res
    .status(HttpStatus.UNAUTHORIZED)
    .send({ message: "Необходима авторизация" });
};

const handleExpiredAuthError = (res: Response) => {
  res.status(HttpStatus.UNAUTHORIZED).send({ message: "Время сессии истекло" });
};

const extractBearerToken = (header: string) => {
  return header.replace("Bearer ", "");
};

export default function accessMiddleware(
  req: SessionRequest,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return handleAuthError(res);
  }

  const token = extractBearerToken(authorization);
  let payload:JwtPayload;

  try {
    payload = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return handleExpiredAuthError(res);
    }
    return handleAuthError(res);
  }
  req.user = payload;

  next();
}
