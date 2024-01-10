// routes/routes.ts
import express from 'express'
import axios from 'axios'
import bodyParser from 'body-parser'
import path from 'path'
import { config } from 'dotenv'
import { authenticate } from '../middleware/auth'
config({
  path: process.env.NODE_ENV?.toLowerCase().startsWith('prod') ? `.env.prod` : '.env.dev',
})

const router = express.Router()
const PROXYCURL_API_KEY = process.env.API_TOKEN
const HOST_URL = process.env.HOST_URL

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

interface EmployeeData {
  employees: any[]
  next_page: any
}

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
    const response = await axios.get('https://nubela.co/proxycurl/api/linkedin/profile/email', {
      params: {
        linkedin_profile_url: linkedin_profile_url,
        callback_url: HOST_URL + '/workEmailWebhook',
      },
      headers: {
        Authorization: `Bearer ${PROXYCURL_API_KEY}`,
      },
    })
    const emailLookupResult = response.data
    console.log(emailLookupResult)
    res.json(emailLookupResult)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.post('/workEmailWebhook', (req, res) => {
  const callbackData = req.body
  console.log('got data from proxyUrl-:', callbackData)
  res.status(200).send('Webhook received successfully')
})

export default router
