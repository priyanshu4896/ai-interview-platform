import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 90000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export const getErrorMessage = (error) =>
  error.response?.data?.detail || error.message || 'Something went wrong. Please try again.'

export default api
