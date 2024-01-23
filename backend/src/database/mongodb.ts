import { MongoClient, Db, InsertOneResult } from 'mongodb'
import EmailData from './Models/EmailData'

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

      await this.createUniqueIndex()
    } catch (error) {
      console.error('Error connecting to MongoDB:', error)
    }
  }

  private async createUniqueIndex() {
    try {
      // Create a unique index on the linkedinProfile field
      await this.db.collection('emails_data').createIndex({ linkedinProfile: 1 }, { unique: true })
    } catch (error) {
      console.error('Error creating unique index:', error)
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
  async emailExists(linkedinProfile: string): Promise<boolean> {
    try {
      // Check if an email with the given linkedinProfile already exists
      const count = await this.db.collection('emails_data').countDocuments({ linkedinProfile })
      return count > 0
    } catch (error) {
      console.error('Error checking if email exists:', error)
      throw error
    }
  }
  async insertEmailToEmailsCollection(emailData: EmailData): Promise<string | InsertOneResult<EmailData>> {
    try {
      // Insert the new emailData
      const result = await this.db.collection('emails_data').insertOne(emailData)

      // Return the result of the insertion
      return result
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.linkedinProfile === 1) {
        // Handle duplicate key error (code 11000) for linkedinProfile
        return 'Profile already exists'
      }

      console.error('Error inserting EmailData:', error)
      throw error
    }
  }
}

export default MongoDb
