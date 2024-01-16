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
      // Make a request to your Express server for authentication
      const response = await axios.post('http://localhost:3030/login', { password });

      // Assuming your server returns a token upon successful authentication
      const authToken = response.data.token;

      // Store the token in localStorage
      localStorage.setItem('token', authToken);

      setToken(authToken);

      // Navigate to the /data route after successful login
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
