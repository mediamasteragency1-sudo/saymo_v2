import api from './axios'

export const getReviews = (params) => api.get('/reviews/', { params })
export const createReview = (data) => api.post('/reviews/', data)
export const replyToReview = (id, reply) => api.put(`/reviews/${id}/reply/`, { host_reply: reply })
