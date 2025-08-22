import { Request, Response, NextFunction } from 'express';
import { QueryFailedError } from 'typeorm';
import { HttpStatus } from '../utils/constants';


export default function errHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
    if (
            typeof err === "object" &&
            err !== null &&
            "code" in err &&
            err.code === "23505"
          ) {
            const drivererr = (err as unknown as QueryFailedError)
              .driverError as {
              detail?: string;
              table?: string;
            };
    
            const detail = drivererr?.detail ?? "";
            const table = drivererr?.table ?? "Entity";
            const match = detail.match(/\((.+?)\)=\((.+?)\)/);
            const field = match?.[1];
            const value = match?.[2];
    
            const message =
              field && value
                ? `${table} с таким ${field} ${value} уже существует`
                : `${table} с таким уникальным значением уже существует`;
    
            res.status(HttpStatus.CONFLICT).json({
              statusCode: HttpStatus.CONFLICT,
              message,
            });
            return;
          }

  return res.status(500).send({
    message: 'Произошла ошибка на сервере',
  });
}
