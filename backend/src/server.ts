import { config } from 'dotenv'
export const IS_PROD_OR_DEV = process.env.NODE_ENV?.toLowerCase().startsWith('prod') ? true : false
config({
  path: IS_PROD_OR_DEV ? `.env.prod` : '.env.dev',
})
import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import routes from './Routes/routes'
import { setupWebSocket } from './WebSocket/webSocket'
import MongoDb from './database/mongodb'
const app = express()
const server = http.createServer(app)
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
})
export const db = new MongoDb()
const PORT = process.env.PORT || 3030

app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json())
app.use('/', routes)

setupWebSocket(io, db)

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
