import 'dotenv/config';
import { DataSource } from "typeorm"

console.log(process.env.postgres_host)
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || "postgres",
  password: process.env.POSTGRES_PASSWORD || "1111",
  database: process.env.POSTGRES_DB || "TRexpress",
  synchronize: !!process.env.POSTGRES_SYNC ,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
});
