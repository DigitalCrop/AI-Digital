import axios from 'axios'

const baseURL = process.env.API_URL || 'http://localhost:4000'

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})

// allow cookies for refresh token endpoints by default
client.defaults.withCredentials = true

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

client.interceptors.request.use((config) => {
  if (authToken) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${authToken}` }
  // attach correlation id if not present
  if (!config.headers!['X-Correlation-Id']) {
    config.headers!['X-Correlation-Id'] = `cid-${Date.now()}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    // centralized error handling placeholder
    return Promise.reject(error)
  }
)

export default client
