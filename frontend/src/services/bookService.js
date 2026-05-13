import api from '../api/axios'

const bookService = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  search: (q) => api.get(`/search?q=${encodeURIComponent(q)}`),
}

export default bookService
