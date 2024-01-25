// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthComponent from './components/AuthComponent';
import DataComponent from './components/DataComponent';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId="110847195961-382fmhs7nsdgcpcs07hpe8lrs1qeocma.apps.googleusercontent.com">
    <Router>
      <div>
        <h1>Yonit's Helper</h1>
        <AuthComponent />
        <Routes>
          <Route
            path="/data"
            element={<DataComponent />}
          />
        </Routes>
      </div>
    </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
