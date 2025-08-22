import { Response } from "express";
import { ValidationError } from "class-validator";
import { HttpStatus } from "./constants";

export const validateErrorHandler = (res: Response, paramErrors: ValidationError[]): void => {
  try {
    const errorMessages = paramErrors
      .map(error => Object.values(error.constraints || {}))
      .flat();
      
    res.status(HttpStatus.BAD_REQUEST).json({
      message: "Ошибка валидации параметров",
      errors: errorMessages,
    });
  } catch (err) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: "Ошибка валидации параметров",
    });
  }
};