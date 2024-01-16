import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthComponent from './components/AuthComponent';
import DataComponent from './components/DataComponent';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  return (
    <Router>
      <div>
        <h1>Yonit's Helper</h1>
        <AuthComponent />
        <Routes>
          <Route
            path="/data"
            element={token ? <DataComponent /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
