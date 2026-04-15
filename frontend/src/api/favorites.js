import api from './axios'

export const getFavorites = () => api.get('/favorites/')
export const addFavorite = (property_id) => api.post('/favorites/', { property_id })
export const removeFavorite = (id) => api.delete(`/favorites/${id}/`)
