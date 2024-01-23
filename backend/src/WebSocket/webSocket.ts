import { Server as SocketIOServer, Socket } from 'socket.io'
import EmailData from '../database/Models/EmailData'
import MongoDb from '../database/mongodb'
import moment from 'moment'

export function setupWebSocket(io: SocketIOServer, db: MongoDb): void {
  //setup listeners
  io.on('connection', async (socket: Socket) => {
    const currentTime = moment().format()
    console.log(`A user connected at - ${currentTime}`)
    try {
      const allEmailData = await db.getAllEmailData()
      // Emit the initial data to the connected client
      io.to(socket.id).emit('initialEmailData', allEmailData)
    } catch (error) {
      io.to(socket.id).emit('initialEmailData', 'an error occurred in fetching data from db ')
    }

    socket.on('disconnect', () => {
      const currentTime = moment().format()
      console.log(`A user disconnected at - ${currentTime}`)
    })
  })
}
//event emitters
export function emitNewEmailData(io: SocketIOServer, res: EmailData | string): void {
  io.emit('newEmailData', res)
}
