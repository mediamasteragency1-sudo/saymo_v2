import api from './axios'

export const getProperties = (params) => api.get('/properties/', { params })
export const getProperty = (id) => api.get(`/properties/${id}/`)
export const createProperty = (data) => api.post('/properties/', data)
export const updateProperty = (id, data) => api.put(`/properties/${id}/`, data)
export const deleteProperty = (id) => api.delete(`/properties/${id}/`)
export const uploadImage = (id, formData) => api.post(`/properties/${id}/images/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getAvailability = (id) => api.get(`/properties/${id}/availability/`)
export const updateAvailability = (id, data) => api.put(`/properties/${id}/availability/`, data)
export const getAmenities = () => api.get('/properties/amenities/')
export const getHostProperties = () => api.get('/properties/host/mine/')
