import React, { useState } from 'react';
import axios from 'axios';

const DataComponent: React.FC = () => {
  const [companyUrl, setCompanyUrl] = useState('');
  const [jobTitleKeywords, setJobTitleKeywords] = useState('');
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:3030/getEmployeeInfo',
        { companyUrl, jobTitleKeywords },
        {
          headers: {
            Authorization: ` ${localStorage.getItem('token')}`,
          },
        }
      );
      setEmployeeData(response.data.employees);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again.');
    } finally {
      setIsLoading(false);
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
    await fetchData(); // Await for fetchData to complete before proceeding
  };

  return (
    <div>
      <h2>Data Component</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Company URL:
          <input type="text" name="companyUrl" value={companyUrl} onChange={handleInputChange} />
        </label>
        <label>
          Job Title Keywords:
          <input
            type="text"
            name="jobTitleKeywords"
            value={jobTitleKeywords}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          Fetch Data
        </button>
      </form>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h3>Employee Data</h3>
      <pre>{JSON.stringify(employeeData, null, 2)}</pre>
    </div>
  );
};

export default DataComponent;
