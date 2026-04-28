import api from './axios'

export const getBookings     = () => api.get('/bookings/')
export const getHostBookings = () => api.get('/bookings/host/')
export const getBooking = (id) => api.get(`/bookings/${id}/`)
export const createBooking = (data) => api.post('/bookings/', data)
export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status/`, { status })
export const confirmPayment = (id) => api.post(`/bookings/${id}/confirm-payment/`)
