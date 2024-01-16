import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
config({
  path: process.env.NODE_ENV?.toLowerCase().startsWith('prod') ? `.env.prod` : '.env.dev',
})
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization
  console.log(token)
  if (!token) {
    console.log("missing token in header")
    return res.status(401).json({ error: 'Unauthorized: Token missing' })
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_PASS)
    console.log(decoded)
    req.user = decoded
    next()
  } catch (error) {
    console.log("Unauthorized: Invalid token")
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}
