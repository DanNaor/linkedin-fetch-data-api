import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthComponent: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const login = async () => {
    try {
      const response = await axios.post(process.env.REACT_APP_SERVER_URL+'/login', { password });

      const authToken = response.data.token;

      localStorage.setItem('token', authToken);

      setToken(authToken);

      navigate('/data');
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const logout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    setToken(null);

    // Navigate to the home route after logout
    navigate('/');
  };

  return (
    <div>
      {token ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <div>
          <label>
            Password:
            <input type="password" name="password" value={password} onChange={handleChange} />
          </label>
          <button onClick={login}>Login</button>
        </div>
      )}
    </div>
  );
};

export default AuthComponent;
