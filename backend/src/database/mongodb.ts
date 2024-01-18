import { MongoClient, Db ,InsertOneResult } from 'mongodb'
import EmailData from './Models/EmailData'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017'
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'Email_data_dev'

let db: Db

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    db = client.db(MONGODB_DB_NAME)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}
export async function insertEmailToEmailsCollection(emailData: EmailData): Promise<InsertOneResult<EmailData>> {
  try {
    const result = await db.collection('emails_data').insertOne(emailData);
    return result;
  } catch (error) {
    console.error('Error inserting EmailData:', error);
    throw error;
  }
}
connectToDatabase()

export { db }
