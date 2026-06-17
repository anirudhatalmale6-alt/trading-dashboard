const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  }
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body)
  }
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type']
  }
  const res = await fetch(url, config)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  getDashboard: () => request('/dashboard'),

  getTrades: (params = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.set(k, v) })
    return request(`/trades?${qs}`)
  },
  getTrade: (id) => request(`/trades/${id}`),
  createTrade: (data) => request('/trades', { method: 'POST', body: data }),
  updateTrade: (id, data) => request(`/trades/${id}`, { method: 'PUT', body: data }),
  deleteTrade: (id) => request(`/trades/${id}`, { method: 'DELETE' }),
  uploadScreenshot: (tradeId, file, label) => {
    const form = new FormData()
    form.append('file', file)
    if (label) form.append('label', label)
    return request(`/trades/${tradeId}/screenshots`, { method: 'POST', body: form })
  },
  getSymbols: () => request('/trades/stats/symbols'),
  getStrategies: () => request('/trades/stats/strategies'),

  getJournal: (params = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.set(k, v) })
    return request(`/journal?${qs}`)
  },
  getJournalEntry: (id) => request(`/journal/${id}`),
  createJournalEntry: (data) => request('/journal', { method: 'POST', body: data }),
  updateJournalEntry: (id, data) => request(`/journal/${id}`, { method: 'PUT', body: data }),
  deleteJournalEntry: (id) => request(`/journal/${id}`, { method: 'DELETE' }),

  getEntryModels: (activeOnly = false) => request(`/entry-models?active_only=${activeOnly}`),
  getEntryModel: (id) => request(`/entry-models/${id}`),
  createEntryModel: (data) => request('/entry-models', { method: 'POST', body: data }),
  updateEntryModel: (id, data) => request(`/entry-models/${id}`, { method: 'PUT', body: data }),
  deleteEntryModel: (id) => request(`/entry-models/${id}`, { method: 'DELETE' }),

  getRules: () => request('/rules'),
  createRule: (data) => request('/rules', { method: 'POST', body: data }),
  updateRule: (id, data) => request(`/rules/${id}`, { method: 'PUT', body: data }),
  deleteRule: (id) => request(`/rules/${id}`, { method: 'DELETE' }),

  syncMT5: (data) => request('/mt5/sync', { method: 'POST', body: data }),
  getAccountHistory: () => request('/mt5/account'),
}
