import api from './axios'

export const register = (data) => api.post('/auth/register/', data)
export const login = (data) => api.post('/auth/login/', data)
export const logout = (refresh) => api.post('/auth/logout/', { refresh })
export const getMe = () => api.get('/auth/me/')
export const updateMe = (data) => api.put('/auth/me/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const forgotPassword = (email) => api.post('/auth/forgot-password/', { email })
export const resetPassword  = (uid, token, password) => api.post('/auth/reset-password/', { uid, token, password })
