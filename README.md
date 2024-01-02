LinkedIn Employee Info App
This is a simple web application built with Express to fetch employee information from LinkedIn using the ProxyCurl API.

Prerequisites
Node.js installed
ProxyCurl API Key you can generate it here- https://nubela.co/proxycurl/pricing
Getting Started

Create a .env file in the root directory and add your ProxyCurl API Key:
  
API_TOKEN=your-proxycurl-api-key
PORT=3030

Run the application:

npm start
Open your browser and go to http://localhost:3030.

Usage
Enter the LinkedIn Company URL and Job Title Keywords (Regex) in the form.
each.
just to clarify cost for each successful api call - 10 credits / successful request, + 6 credits / employee returned.  
Click the "Get Employee Info" button to fetch employee information.

API Endpoints
POST /getEmployeeInfo: Fetch employee information from LinkedIn.
Folder Structure
src: Contains the source code.
public: Contains the HTML file.
Dependencies
Express
Axios
Body-parser
Dotenv

Author:
Dan Naor
