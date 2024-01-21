import { MongoClient, Db, InsertOneResult } from 'mongodb'
import EmailData from './Models/EmailData'
import { emitNewEmailData } from '../WebSocket/webSocket'

class MongoDb {
  private db!: Db

  constructor() {
    this.connectToDatabase()
  }

  private async connectToDatabase() {
    try {
      const client = await MongoClient.connect(process.env.MONGODB_URI)
      console.log('Connected to MongoDB')
      this.db = client.db(process.env.MONGODB_DB_NAME)
    } catch (error) {
      console.error('Error connecting to MongoDB:', error)
    }
  }

  async getAllEmailData(): Promise<EmailData[]> {
    try {
      // Fetch all email data from the MongoDB collection
      const emailDataCollection = this.db.collection('emails_data')
      const allEmailData = (await emailDataCollection.find().toArray()) as EmailData[]
      return allEmailData
    } catch (error) {
      console.error('Error fetching all EmailData:', error)
      throw error
    }
  }

  async insertEmailToEmailsCollection(emailData: EmailData): Promise<InsertOneResult<EmailData>> {
    try {
      const result = await this.db.collection('emails_data').insertOne(emailData)
      return result
    } catch (error) {
      console.error('Error inserting EmailData:', error)
      throw error
    }
  }
}

export default MongoDb
