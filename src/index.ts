import * as express from "express"
import * as bodyParser from "body-parser"
import { AppDataSource } from "./config/data-source"
import userRouter  from "./routes/user"

const PORT = process.env.PORT || 3000

AppDataSource.initialize().then(async () => {
    const app = express()
    app.use(bodyParser.json())

    app.use('/users',userRouter)
     
   app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => console.log(error))