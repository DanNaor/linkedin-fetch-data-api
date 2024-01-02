import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3030;
const PROXYCURL_API_KEY = process.env.API_TOKEN

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

interface EmployeeData {
  employees: any[];
  next_page: any;
}

app.post('/getEmployeeInfo', async (req, res) => {
  try {
    const { companyUrl, jobTitleKeywords } = req.body;

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
    });

    const employeeData = response.data;
    res.json(employeeData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
