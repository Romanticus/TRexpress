import  express from "express"
import { AppDataSource } from "./config/data-source"
import { PORT } from "./utils/constants"

AppDataSource.initialize().then(async () => {
    const app = express()
    app.use(express.json())

    // app.use('/users',userRouter)
     
   app.listen(PORT, () => {
    console.log(`Сервер запущен на порту: ${PORT}`);
  });
}).catch(error => console.log(error))