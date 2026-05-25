import api from '../api/axios';

export const getSummary = () => api.get('/analytics/summary');
export const getPopularBooks = () => api.get('/analytics/popular-books');
export const getCategoryWise = () => api.get('/analytics/category-wise');
export const getMonthlyTrends = () => api.get('/analytics/monthly-trends');
export const getOverdue = () => api.get('/analytics/overdue');
