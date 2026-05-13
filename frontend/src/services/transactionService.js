import api from '../api/axios'

const transactionService = {
  getAll: () => api.get('/transactions'),
  borrow: (data) => api.post('/borrow', data),
  returnBook: (data) => api.post('/return', data),
  getStats: () => api.get('/dashboard/stats'),
}

export default transactionService
