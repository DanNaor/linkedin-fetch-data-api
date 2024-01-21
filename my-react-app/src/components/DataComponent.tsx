import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

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

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3030');
  
    // Set the socket instance in the state
    setSocket(newSocket);
  
    // Clean up the socket connection when the component unmounts
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        setSocket(null); // Reset the socket instance in the state
      }
    };
  }, []); // E
  useEffect(() => {
    if (socket) {
      // Listen for the initial data
      socket.on('initialEmailData', (data: any) => {
        setRealTimeData(data);
      });

      // Listen for new data
      socket.on('newEmailData', (newData: any) => {
        setRealTimeData((prevData) => [...prevData, newData]);
      });
    }

    // Clean up the event listeners when the component unmounts
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
      // Only need to check the status code
      await axios.get(process.env.REACT_APP_SERVER_URL + '/lookupWorkEmail', {
        params: {
          linkedin_profile_url: linkedinProfileUrl,
        },
        headers: {
          Authorization: ` ${localStorage.getItem('token')}`,
        },
      });
  
      setErrorEmailLookup(null);
    } catch (error) {
      console.error('Error triggering email lookup:', error);
      setErrorEmailLookup('Error triggering email lookup. Please try again.');
    } finally {
      try {
        // Ensure that setIsLoadingEmailLookup(false) is executed after updating the state
        setIsLoadingEmailLookup(false);
      } catch (error) {
        console.error('Error resetting loading state:', error);
      }
    }
  };
  

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

      <h2>Real-time Data</h2>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataComponent;
