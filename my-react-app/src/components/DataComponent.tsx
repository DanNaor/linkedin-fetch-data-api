import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DataComponent: React.FC = () => {
  const [companyUrl, setCompanyUrl] = useState('')
  const [jobTitleKeywords, setJobTitleKeywords] = useState('')
  const [employeeData, setEmployeeData] = useState<any[]>([])
  const [isLoadingEmployeeData, setIsLoadingEmployeeData] = useState(false)
  const [errorEmployeeData, setErrorEmployeeData] = useState<string | null>(null)
  const [linkedinProfileUrl, setLinkedinProfileUrl] = useState('')
  const [emailLookupResult, setEmailLookupResult] = useState<any | null>(null)
  const [isLoadingEmailLookup, setIsLoadingEmailLookup] = useState(false)
  const [errorEmailLookup, setErrorEmailLookup] = useState<string | null>(null)



  const fetchData = async () => {
    setIsLoadingEmployeeData(true)
    try {
      const response = await axios.post(
        process.env.REACT_APP_SERVER_URL+'/getEmployeeInfo',
        { companyUrl, jobTitleKeywords },
        {
          headers: {
            Authorization: ` ${localStorage.getItem('token')}`,
          },
        },
      )
      setEmployeeData(response.data.employees)
      setErrorEmployeeData(null)
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorEmployeeData('Error fetching data. Please try again.')
    } finally {
      setIsLoadingEmployeeData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'companyUrl') {
      setCompanyUrl(value)
    } else if (name === 'jobTitleKeywords') {
      setJobTitleKeywords(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetchData()
  }

  const handleEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingEmailLookup(true)

    try {
      console.log('Request URL:', process.env.REACT_APP_SERVER_URL + '/lookupWorkEmail', {
        params: {
          linkedin_profile_url: linkedinProfileUrl,
        },
      });
      const response = await axios.get(process.env.REACT_APP_SERVER_URL+'/lookupWorkEmail', {
        params: {
          linkedin_profile_url: linkedinProfileUrl,
        },
        headers: {
          Authorization: ` ${localStorage.getItem('token')}`,
        },
      })
      console.log(response)
      setErrorEmailLookup(null)
    } catch (error) {
      console.error('Error fetching email lookup data:', error)
      setErrorEmailLookup('Error fetching email lookup data. Please try again.')
    } finally {
      setIsLoadingEmailLookup(false)
    }
  }
  return (
    <div>
      <h2>operations-</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Company URL:
          <input type="text" name="companyUrl" value={companyUrl} onChange={handleInputChange} />
        </label>
        <label>
          Job Title Keywords:
          <input type="text" name="jobTitleKeywords" value={jobTitleKeywords} onChange={handleInputChange} />
        </label>
        <button type="submit" disabled={isLoadingEmployeeData}>
          Fetch Data
        </button>
      </form>
      {isLoadingEmployeeData && <p>Loading employee data...</p>}
      {errorEmployeeData && <p style={{ color: 'red' }}>{errorEmployeeData}</p>}
      <h3>Employee Data</h3>
      <pre>{JSON.stringify(employeeData, null, 2)}</pre>

      <h2>Email Lookup</h2>
      <form onSubmit={handleEmailLookup}>
        <label>
          LinkedIn Profile URL:
          <input type="text" value={linkedinProfileUrl} onChange={(e) => setLinkedinProfileUrl(e.target.value)} />
        </label>
        <button type="submit" disabled={isLoadingEmailLookup}>
          Lookup Email
        </button>
      </form>
      {isLoadingEmailLookup && <p>Loading email lookup data...</p>}
      {errorEmailLookup && <p style={{ color: 'red' }}>{errorEmailLookup}</p>}
      {emailLookupResult && (
        <div>
          <h3>Email Lookup Result</h3>
          <pre>{JSON.stringify(emailLookupResult, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default DataComponent
