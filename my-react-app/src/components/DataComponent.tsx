import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import CsvDownloadButton from 'react-json-to-csv';
import { saveAs } from 'file-saver';

const DataComponent: React.FC = () => {
  const [companyUrl, setCompanyUrl] = useState('');
  const [jobTitleKeywords, setJobTitleKeywords] = useState('');
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [isLoadingEmployeeData, setIsLoadingEmployeeData] = useState(false);
  const [errorEmployeeData, setErrorEmployeeData] = useState<string | null>(null);
  const [linkedinProfileUrl, setLinkedinProfileUrl] = useState('');
  const [isLoadingEmailLookup, setIsLoadingEmailLookup] = useState(false);
  const [errorEmailLookup, setErrorEmailLookup] = useState<string | null>(null);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [isWebSocketError, setIsWebSocketError] = useState(false);
  const [isEmailLookupError, setIsEmailLookupError] = useState(false);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3030');

    setSocket(newSocket);

    newSocket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
      setIsWebSocketError(true);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        setSocket(null);
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('initialEmailData', (data: any) => {
        setRealTimeData(data);
      });

      socket.on('newEmailData', (newData: any) => {
        setRealTimeData((prevData) => [...prevData, newData]);
      });
    }

    return () => {
      if (socket) {
        socket.off('initialEmailData');
        socket.off('newEmailData');
      }
    };
  }, [socket]);

  const fetchEmployeeData = async () => {
    setIsLoadingEmployeeData(true);
    try {
      const response = await axios.post(
        process.env.REACT_APP_SERVER_URL + '/getEmployeeInfo',
        { companyUrl, jobTitleKeywords },
        { 
          headers: {
            Authorization: ` ${localStorage.getItem('token')}`,
          },
        },
      );
      setEmployeeData(response.data.employees);
      setErrorEmployeeData(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorEmployeeData('Error fetching data. Please try again.');
    } finally {
      setIsLoadingEmployeeData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'companyUrl') {
      setCompanyUrl(value);
    } else if (name === 'jobTitleKeywords') {
      setJobTitleKeywords(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchEmployeeData();
  };

  const handleEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingEmailLookup(true);

    try {
      await axios.get(process.env.REACT_APP_SERVER_URL + '/lookupWorkEmail', {
        params: {
          linkedin_profile_url: linkedinProfileUrl,
        },
        headers: {
          Authorization: ` ${localStorage.getItem('token')}`,
        },
      });

      setErrorEmailLookup(null);
      setIsEmailLookupError(false);
    } catch (error) {
      console.error('Error triggering email lookup:', error);
      setErrorEmailLookup('Error triggering email lookup. Please try again.');
      setIsEmailLookupError(true);
    } finally {
      try {
        setIsLoadingEmailLookup(false);
      } catch (error) {
        console.error('Error resetting loading state:', error);
      }
    }
  };

  const handleDownload = () => {
    // Download as CSV
    const csvContent = 'data:text/csv;charset=utf-8,' + employeeData.map((row) => Object.values(row).join(',')).join('\n');
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    saveAs(csvBlob, 'employee_data.csv');

    // Download as JSON
    const jsonContent = JSON.stringify(employeeData, null, 2);
    const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
    saveAs(jsonBlob, 'employee_data.json');
  };

  function addToHubSpot(data: any): void {
    const { emailAddress , linkedinProfile } = data;
    
    
    console.log(emailAddress)
    axios.post(
      process.env.REACT_APP_SERVER_URL + '/addContact',
      //clientEmailAddress will be the connected user's email address and linkedinProfile will be linkedinProfile
      { clientEmailAddress: "dan@shuffll.com", emailAddress,linkedinProfile:"https://www.linkedin.com/in/aviv-cazum/" },  
      {
        headers: {
          Authorization: ` ${localStorage.getItem('token')}`,
        },
      }
    )
    .then((response) => {
      console.log('Contact added successfully:', response.data);
    })
    .catch((error) => {
      console.error('Error adding contact to HubSpot:', error);
    });
  }
  

  return (
    <div>
      {isWebSocketError && <p style={{ color: 'red', fontSize: '18px' }}>WebSocket connection error. Please check your connection.</p>}
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
      {employeeData.length > 0 && (
        <div>
          <h3>Employee Data</h3>
          <button onClick={handleDownload}>Download CSV & JSON</button>
        </div>
      )}

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
      {isEmailLookupError && <p style={{ color: 'red' }}>{errorEmailLookup}</p>}
      
      <h2>Real-time Email Data</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email Address</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>LinkedIn Profile</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Found</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Deliverability</th>
          </tr>
        </thead>
        <tbody>
          {realTimeData.map((data, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.emailAddress}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.linkedinProfile}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.found ? 'Yes' : 'No'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.deliverability}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              {data.found && <button onClick={() => addToHubSpot(data)}>Add to HubSpot</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataComponent;
