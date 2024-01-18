import { ObjectId } from 'mongodb'

interface EmailData {
  _id?: ObjectId | undefined
  emailAddress: string | null
  linkedinProfile: string
  deliverability?: string | null
  found: boolean
}

export default EmailData
