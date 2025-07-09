import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;
const connectionString = `postgress://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const pool = new Pool({
  connectionString: connectionString,
});

export default pool;
