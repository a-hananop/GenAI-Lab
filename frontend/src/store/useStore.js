import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Dashboard
  stats: null,
  statsLoading: false,
  fetchStats: async () => {
    set({ statsLoading: true })
    try {
      const { dashboardAPI } = await import('../services/api')
      const data = await dashboardAPI.getStats()
      set({ stats: data, statsLoading: false })
    } catch (e) { set({ statsLoading: false }) }
  },

  // Hypotheses
  hypotheses: [],
  hypLoading: false,
  hypGenerating: false,
  fetchHypotheses: async () => {
    set({ hypLoading: true })
    try {
      const { hypothesesAPI } = await import('../services/api')
      const data = await hypothesesAPI.list()
      set({ hypotheses: data, hypLoading: false })
    } catch (e) { set({ hypLoading: false }) }
  },
  generateHypothesis: async (body) => {
    set({ hypGenerating: true })
    try {
      const { hypothesesAPI } = await import('../services/api')
      const data = await hypothesesAPI.generate(body)
      set(s => ({ hypotheses: [data, ...s.hypotheses], hypGenerating: false }))
      return data
    } catch (e) { set({ hypGenerating: false }); throw e }
  },
  approveHypothesis: async (id) => {
    const { hypothesesAPI } = await import('../services/api')
    await hypothesesAPI.approve(id)
    set(s => ({ hypotheses: s.hypotheses.map(h => h.id === id ? { ...h, status: 'approved' } : h) }))
  },
  rejectHypothesis: async (id) => {
    const { hypothesesAPI } = await import('../services/api')
    await hypothesesAPI.reject(id)
    set(s => ({ hypotheses: s.hypotheses.map(h => h.id === id ? { ...h, status: 'rejected' } : h) }))
  },

  // Experiments
  experiments: [],
  expLoading: false,
  expCreating: false,
  fetchExperiments: async () => {
    set({ expLoading: true })
    try {
      const { experimentsAPI } = await import('../services/api')
      const data = await experimentsAPI.list()
      set({ experiments: data, expLoading: false })
    } catch (e) { set({ expLoading: false }) }
  },
  createExperiment: async (body) => {
    set({ expCreating: true })
    try {
      const { experimentsAPI } = await import('../services/api')
      const data = await experimentsAPI.create(body)
      set(s => ({ experiments: [data, ...s.experiments], expCreating: false }))
      return data
    } catch (e) { set({ expCreating: false }); throw e }
  },

  // Simulations
  simulations: [],
  simLoading: false,
  simRunning: false,
  liveProgress: 0,
  liveValue: 0,
  fetchSimulations: async () => {
    set({ simLoading: true })
    try {
      const { simulationsAPI } = await import('../services/api')
      const data = await simulationsAPI.list()
      set({ simulations: data, simLoading: false })
    } catch (e) { set({ simLoading: false }) }
  },
  runSimulation: async (body) => {
    set({ simRunning: true, liveProgress: 0, liveValue: 0 })
    try {
      const { simulationsAPI } = await import('../services/api')
      const data = await simulationsAPI.run(body)
      set(s => ({ simulations: [data, ...s.simulations], simRunning: false, liveProgress: 1 }))
      return data
    } catch (e) { set({ simRunning: false }); throw e }
  },
  setLiveProgress: (p, v) => set({ liveProgress: p, liveValue: v }),

  // Agents
  agents: [],
  agentDebate: null,
  agentDebating: false,
  fetchAgents: async () => {
    const { agentsAPI } = await import('../services/api')
    const data = await agentsAPI.status()
    set({ agents: data })
  },
  runDebate: async (topic, directive) => {
    set({ agentDebating: true })
    try {
      const { agentsAPI } = await import('../services/api')
      const data = await agentsAPI.debate(topic, directive)
      set({ agentDebate: data, agentDebating: false })
      return data
    } catch (e) { set({ agentDebating: false }); throw e }
  },

  // Memory
  memories: [],
  memLoading: false,
  memSearchResults: null,
  knowledgeGraph: null,
  fetchMemories: async (type) => {
    set({ memLoading: true })
    try {
      const { memoryAPI } = await import('../services/api')
      const data = await memoryAPI.list(type)
      set({ memories: data, memLoading: false })
    } catch (e) { set({ memLoading: false }) }
  },
  searchMemory: async (q) => {
    const { memoryAPI } = await import('../services/api')
    const data = await memoryAPI.search(q)
    set({ memSearchResults: data })
  },
  fetchGraph: async () => {
    const { memoryAPI } = await import('../services/api')
    const data = await memoryAPI.graph()
    set({ knowledgeGraph: data })
  },

  // Research Loop
  loopRunning: false,
  loopHistory: [],
  triggerLoop: async () => {
    set({ loopRunning: true })
    try {
      const { researchLoopAPI } = await import('../services/api')
      const data = await researchLoopAPI.trigger()
      set(s => ({ loopHistory: [data, ...s.loopHistory], loopRunning: false }))
      return data
    } catch (e) { set({ loopRunning: false }); throw e }
  },
  fetchLoopHistory: async () => {
    const { researchLoopAPI } = await import('../services/api')
    const data = await researchLoopAPI.history()
    set({ loopHistory: data })
  },

  // Toast notifications
  toasts: [],
  addToast: (msg, type = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

export default useStore
