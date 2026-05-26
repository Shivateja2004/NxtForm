import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDb, isDbReady } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import formRoutes from './routes/formRoutes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const host = '0.0.0.0'
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = new Set([
        clientUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ])

      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true)
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: isDbReady() ? 'connected' : 'disconnected',
  })
})

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next()

  if (!isDbReady()) {
    return res.status(503).json({
      message: 'Database is not connected.',
    })
  }

  return next()
})

app.use('/api/auth', authRoutes)
app.use('/api', formRoutes)

const start = async () => {
  try {
    await connectDb()
    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`)
    })
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}

start()