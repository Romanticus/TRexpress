import "reflect-metadata"
import { DataSource } from "typeorm"


export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB || "TRexpress",
  synchronize: !!process.env.POSTGRES_SYNC ,
  entities: [],
});
