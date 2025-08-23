import express, { Request, Response, NextFunction } from "express";
import { AppDataSource } from "./config/data-source";
import { PORT } from "./utils/constants";
import userRouter from "./routes/userRouter";
import errorHandler from "./middlewares/errorHandler";

AppDataSource.initialize()
  .then(async () => {

    const app = express();
    
    app.use(express.json());

    app.use("/user", userRouter);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту: ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
