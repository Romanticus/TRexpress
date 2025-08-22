import express,  { Request, Response, NextFunction} from "express"
import { AppDataSource } from "./config/data-source"
import { PORT } from "./utils/constants"
import userRouter from "./routes/userRouter"

AppDataSource.initialize().then(async () => {
    const app = express()
    app.use(express.json())

    const timeLog = (req: Request, res: Response, next: NextFunction) => {
      // Добавьте ваше решение здесь
      console.log('Время запроса: ', new Date());
      console.log('URL запроса: ', req.url);
      console.log('Метод запроса: ', req.method);
      next();
    };
    
    app.use(timeLog);
    app.use('/users',userRouter)
     
   app.listen(PORT, () => {
    console.log(`Сервер запущен на порту: ${PORT}`);
  });
}).catch(error => console.log(error))