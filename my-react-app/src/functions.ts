import axios from 'axios';

export const fetchEmployeeData = async (companyUrl: string, jobTitleKeywords: string, token: string) => {
  try {
    const response = await axios.post(
      process.env.REACT_APP_SERVER_URL + '/getEmployeeInfo',
      { companyUrl, jobTitleKeywords },
      {
        headers: {
          Authorization: ` ${token}`,
        },
      },
    );
    return response.data.employees;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Error fetching data. Please try again.');
  }
};

export const lookupWorkEmail = async (linkedinProfileUrl: string, token: string) => {
  try {
    await axios.get(process.env.REACT_APP_SERVER_URL + '/lookupWorkEmail', {
      params: {
        linkedin_profile_url: linkedinProfileUrl,
      },
      headers: {
        Authorization: ` ${token}`,
      },
    });
  } catch (error) {
    console.error('Error triggering email lookup:', error);
    throw new Error('Error triggering email lookup. Please try again.');
  }
};

export const addToHubSpot = async (data: any, clientEmailAddress: string, token: string) => {
  const { emailAddress, linkedinProfile } = data;

  try {
    await axios.post(
      process.env.REACT_APP_SERVER_URL + '/addContact',
      { clientEmailAddress, emailAddress, linkedinProfile },
      {
        headers: {
          Authorization: ` ${token}`,
        },
      }
    );
    console.log('Contact added successfully.');
  } catch (error) {
    console.error('Error adding contact to HubSpot:', error);
    throw new Error('Error adding contact to HubSpot. Please try again.');
  }
};
