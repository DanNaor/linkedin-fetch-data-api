import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'

const AuthComponent: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const navigate = useNavigate()
  async function auth() {
    const response = await fetch(process.env.REACT_APP_SERVER_URL + '/request', { method: 'post' })
    const data = await response.json()
    console.log(data)
    navigate(data.url)
  }
  const googleLoginSuccess = async (response: any) => {
    try {
      const serverResponse = await axios.post(process.env.REACT_APP_SERVER_URL + '/login', {
        googleToken: response.tokenId,
      })

      const authToken = serverResponse.data.token

      localStorage.setItem('token', authToken)
      setToken(authToken)

      navigate('/data')
    } catch (error) {
      console.error('Google Sign-In failed:', error)
    }
  }

  const googleLoginFailure = (error: any) => {
    console.error('Google Sign-In failed:', error)
    console.error('Google Sign-In failed:', error)
  }

  const logout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token')
    setToken(null)

    // Navigate to the home route after logout
    navigate('/')
  }

  return (
    <div>
      {token ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <div>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              console.log(credentialResponse)
            }}
            onError={() => {
              console.log('Login Failed')
            }}
          />
          ;
        </div>
      )}
    </div>
  )
}

export default AuthComponent
