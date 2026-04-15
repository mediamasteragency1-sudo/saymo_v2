import api from './axios'

export const getConversations = () => api.get('/messages/')
export const getUnreadCount   = () => api.get('/messages/unread/')
export const getThread        = (bookingId) => api.get(`/messages/${bookingId}/`)
export const sendMessage      = (bookingId, content) =>
  api.post(`/messages/${bookingId}/`, { content })
