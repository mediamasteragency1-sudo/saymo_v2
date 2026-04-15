import api from './axios'

export const getQuestions = () => api.get('/psychology/questions/')
export const submitTest = (answers) => api.post('/psychology/submit/', { answers })
export const getProfile = () => api.get('/psychology/profile/')
export const getRecommendations = () => api.get('/psychology/recommendations/')
