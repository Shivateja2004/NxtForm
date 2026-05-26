import mongoose from 'mongoose'

let dbReady = false

export const connectDb = async () => {
  const uri = process.env.MONGODB_URI?.trim()

  if (!uri) {
    dbReady = false
    throw new Error('MONGODB_URI is not configured')
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    })
    dbReady = true
    console.log('MongoDB connected')
    return true
  } catch (error) {
    dbReady = false
    console.error('MongoDB connection failed:', error.message)
    throw error
  }
}

mongoose.connection.on('disconnected', () => {
  dbReady = false
  console.warn('MongoDB disconnected')
})

mongoose.connection.on('connected', () => {
  dbReady = true
})

export const isDbReady = () => dbReady