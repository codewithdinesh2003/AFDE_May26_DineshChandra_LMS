import api from '../api/axios'

const borrowerService = {
  getAll: () => api.get('/borrowers'),
  getById: (id) => api.get(`/borrowers/${id}`),
  create: (data) => api.post('/borrowers', data),
  update: (id, data) => api.put(`/borrowers/${id}`, data),
  delete: (id) => api.delete(`/borrowers/${id}`),
}

export default borrowerService
