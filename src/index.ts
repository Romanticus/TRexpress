import * as express from "express"
import { AppDataSource } from "./config/data-source"
import userRouter from "./routes/user"
import { PORT } from "./utils/constants"

AppDataSource.initialize().then(async () => {
    const app = express()
    app.use(express.json())

    // app.use('/users',userRouter)
     
   app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => console.log(error))