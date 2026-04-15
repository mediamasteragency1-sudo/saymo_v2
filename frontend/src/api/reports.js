import api from './axios'

export const createReport       = (data) => api.post('/reports/', data)
export const getAdminReports    = (status = 'pending') => api.get(`/admin/reports/?status=${status}`)
export const resolveReport      = (id, data) => api.patch(`/admin/reports/${id}/resolve/`, data)
