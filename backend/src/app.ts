import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { router as authRouter } from './features/auth/auth.router'
import { router as ordersRouter } from './features/orders/orders.router'
import { router as storesRouter } from './features/stores/stores.router'
import deliveryRouter from './features/delivery/delivery.router'

import { errorsMiddleware } from './middlewares/errorsMiddleware'
import sql from './db'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Rappi Ecosystem API running')
})

app.get('/test-db', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`
    res.json({
      message: 'Supabase connected',
      time: result[0]
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database connection failed' })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/stores', storesRouter)
app.use('/api/delivery', deliveryRouter)

app.use(errorsMiddleware)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})