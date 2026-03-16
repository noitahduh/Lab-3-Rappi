import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env')
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
})

export default sql