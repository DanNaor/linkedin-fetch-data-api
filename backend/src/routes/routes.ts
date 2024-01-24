import express from 'express'
import axios from 'axios'
import bodyParser from 'body-parser'
import Emailable from 'emailable'
import jwt from 'jsonwebtoken'
import hubspotClient from '../hubspotClient'
import { authenticate } from '../Middleware/auth'
import { workEmailWebhookData } from '../define'
import EmailData from '../database/Models/EmailData'
import { IS_PROD_OR_DEV, db, io } from '../server'
import { emitNewEmailData } from '../WebSocket/webSocket'

const emailable = Emailable(process.env.EMAIL_ABLE_KEY)
const router = express.Router()
const PROXYCURL_API_KEY = process.env.PROXY_CURL_API
const HOST_URL = process.env.HOST_URL

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

interface EmployeeData {
  employees: any[]
  next_page: any
}

router.post('/login', async (req, res) => {
  const { password } = req.body

  if (password !== process.env.AUTH_PASS) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = jwt.sign({ password }, process.env.AUTH_PASS, { expiresIn: '1h' })
  console.log(token)
  console.log('user logged in')
  res.json({ token })
})

router.post('/getEmployeeInfo', authenticate, async (req, res) => {
  try {
    const { companyUrl, jobTitleKeywords } = req.body
    const response = await axios.get<EmployeeData>('https://nubela.co/proxycurl/api/linkedin/company/employee/search/', {
      params: {
        linkedin_company_profile_url: companyUrl,
        keyword_regex: jobTitleKeywords,
        page_size: '10',
        enrich_profiles: 'enrich',
        resolve_numeric_id: 'false',
      },
      headers: {
        Authorization: `Bearer ${PROXYCURL_API_KEY}`,
      },
    })
    const employeeData = response.data
    console.log(employeeData)
    res.json(employeeData)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.get('/lookupWorkEmail', authenticate, async (req, res) => {
  try {
    const { linkedin_profile_url } = req.query
    if (!linkedin_profile_url) {
      return res.status(400).json({ error: 'LinkedIn profile URL is required.' })
    }
    const isExist = await db.emailExists(linkedin_profile_url as string)
    if (isExist) {
      return res.status(400).json({ error: 'already exist.' })
    }
    if (IS_PROD_OR_DEV) {
      const response = await axios.get('https://nubela.co/proxycurl/api/linkedin/profile/email', {
        params: {
          linkedin_profile_url: linkedin_profile_url,
          callback_url: HOST_URL + `/workEmailWebhook`,
        },
        headers: {
          Authorization: `Bearer ${PROXYCURL_API_KEY}`,
        },
      })
      const emailLookupResult = response.data
      console.log(emailLookupResult)
      res.json(emailLookupResult)
    }
    if (!IS_PROD_OR_DEV) {
      //return random data
      const postData: workEmailWebhookData = {
        email: (() => {
          const randomString = Math.random().toString(36).substring(7)
          return `random_${randomString}@domain.com`
        })(),
        status: 'email_found',
        profile_url: (() => {
          const randomString = Math.random().toString(36).substring(7)
          return `https://www.linkedin.com/in/${randomString}`
        })(),
      }
      await axios.post(`${HOST_URL}/workEmailWebhook`, postData)
      console.log('sent webhook data')
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.post('/addContact', authenticate, async (req, res) => {
  try {
    const { clientEmailAddress, contactEmailAddress } = req.body
    //will always be a dan@shuffll.com address in dev
    if (!contactEmailAddress || !clientEmailAddress) {
      return res.status(400).json({ error: 'Incomplete data provided.' })
    }
    const ownerId = await hubspotClient.getOwnerId(clientEmailAddress)

    const contactObj = {
      properties: {
        firstname: contactEmailAddress,
        email: contactEmailAddress,
      },
    }

    // const hubspotContactProperties = {
    //   properties:{
    //     //will be the users real name after MVP deployed
    //     { property: 'NAME', value: contactEmailAddress },
    //     { property: 'EMAIL', value: contactEmailAddress },
    //     { property: 'CONTACT OWNER', value: ownerId },
    //     // { property: 'LEAD STATUS', value: 'Linkedin Contact' },
    //     // { property: 'MARKETING CONTACT STATUS', value: 'Marketing Contact' },
    //   },
    // }

    // Use the HubSpot client to create the contact
    await hubspotClient.createContact(contactObj)

    // Respond with success
    res.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
router.post('/workEmailWebhook', async (req, res) => {
  const callbackData: workEmailWebhookData = req.body
  console.log('got data from proxyUrl-:', callbackData)
  //firstly check if proxy curl found an email
  if (callbackData.email) {
    //if its prod check email's deliverability and send to mongo
    if (IS_PROD_OR_DEV) {
      emailable
        .verify(callbackData.email)
        .then(function (response: any) {
          const emailData: EmailData = {
            emailAddress: callbackData.email,
            linkedinProfile: callbackData.profile_url,
            found: true,
            deliverability: response.state,
          }
          db.insertEmailToEmailsCollection(emailData)
          emitNewEmailData(io, emailData)
        })
        .catch(function (error: any) {
          console.log(error)
        })
    } else {
      const emailData: EmailData = {
        emailAddress: callbackData.email,
        linkedinProfile: callbackData.profile_url,
        found: true,
        deliverability: 'deliverable',
      }
      const res = db.insertEmailToEmailsCollection(emailData)
      emitNewEmailData(io, emailData)
    }
  }
  //proxycurl couldn't find an email for this linkedin user
  else {
    const emailData: EmailData = {
      emailAddress: null,
      linkedinProfile: callbackData.profile_url,
      found: false,
      deliverability: null,
    }
    db.insertEmailToEmailsCollection(emailData)
    emitNewEmailData(io, emailData)
  }
})

export default router
