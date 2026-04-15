import api from './axios'

export const adminGetUsers = () => api.get('/admin/users/')
export const adminUpdateUser = (id, data) => api.put(`/admin/users/${id}/`, data)
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}/`)
export const adminGetProperties = (params = {}) => api.get('/admin/properties/', { params })
export const adminModerateProperty = (id, data) => api.patch(`/admin/properties/${id}/moderate/`, data)
export const adminDeleteProperty = (id) => api.delete(`/admin/properties/${id}/`)
export const adminGetReports = (status = 'pending') => api.get(`/admin/reports/?status=${status}`)
export const adminResolveReport = (id, data) => api.patch(`/admin/reports/${id}/resolve/`, data)
export const adminGetBookings = () => api.get('/admin/bookings/')
export const adminDeleteBooking = (id) => api.delete(`/admin/bookings/${id}/`)
export const adminDeleteReview = (id) => api.delete(`/admin/reviews/${id}/`)
export const adminGetAnalytics = () => api.get('/admin/analytics/')
