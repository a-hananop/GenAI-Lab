import axios from 'axios'

// Use Vercel's environment variable if set, otherwise fallback to Vite proxy for local dev
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_URL, timeout: 60000 })

api.interceptors.response.use(
  r => r.data,
  e => Promise.reject(e.response?.data?.detail || e.message || 'Request failed')
)

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}

export const hypothesesAPI = {
  generate: (body) => api.post('/hypotheses/generate', body),
  list: () => api.get('/hypotheses'),
  approve: (id) => api.put(`/hypotheses/${id}/approve`),
  reject: (id) => api.put(`/hypotheses/${id}/reject`),
  setStatus: (id, status) => api.put(`/hypotheses/${id}/status?status=${status}`),
}

export const experimentsAPI = {
  create: (body) => api.post('/experiments/create', body),
  list: () => api.get('/experiments'),
  get: (id) => api.get(`/experiments/${id}`),
}

export const simulationsAPI = {
  list: () => api.get('/simulations'),
  types: () => api.get('/simulations/types'),
  run: (body) => api.post('/simulations/run', body),
  get: (id) => api.get(`/simulations/${id}`),
}

export const agentsAPI = {
  status: () => api.get('/agents/status'),
  debate: (topic, directive) => api.post('/agents/debate', { topic, directive }),
}

export const memoryAPI = {
  list: (type) => api.get('/memory' + (type ? `?memory_type=${type}` : '')),
  search: (q) => api.get(`/memory/search?q=${encodeURIComponent(q)}`),
  graph: () => api.get('/memory/graph'),
  store: (body) => api.post('/memory/store', body),
}

export const analysisAPI = {
  get: (expId) => api.get(`/analysis/${expId}`),
}

export const researchLoopAPI = {
  trigger: () => api.post('/research-loop/trigger'),
  history: () => api.get('/research-loop/history'),
  status: () => api.get('/research-loop/status'),
}

export const reportsAPI = {
  generate: () => api.get('/reports/generate'),
}

export const supportAPI = {
  chat: (body) => api.post('/support/chat', body),
}

export default api
