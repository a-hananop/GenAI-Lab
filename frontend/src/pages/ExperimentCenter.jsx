import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import { StatusBadge, MethodBadge, LoadingCenter, ScorePill } from '../components/UI/index'

const METHODOLOGIES = ['A/B Test','Bayesian Optimization','Monte Carlo Simulation','Multi-Arm Bandit','Reinforcement Learning','Genetic Algorithm','Digital Twin']

export default function ExperimentCenter() {
  const { experiments, expLoading, expCreating, hypotheses, fetchExperiments, fetchHypotheses, createExperiment, addToast } = useStore()
  const [form, setForm] = useState({ hypothesis_id: '', methodology: '' })
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('all')

  useEffect(() => { fetchExperiments(); fetchHypotheses() }, [])

  const handleCreate = async () => {
    if (!form.hypothesis_id) { addToast('Please select a hypothesis', 'error'); return }
    try {
      addToast('Gemini is designing your experiment…', 'info')
      const exp = await createExperiment(form)
      addToast('Experiment designed successfully!', 'success')
    } catch (e) { addToast('Failed: ' + e, 'error') }
  }

  const filtered = tab === 'all' ? experiments : experiments.filter(e => e.status === tab)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title"><span className="page-title-icon">🔬</span> Experiment Center</div>
        <p className="page-desc">Design rigorous experiments from approved hypotheses. Gemini auto-selects methodology, metrics, and control groups.</p>
      </div>

      {/* Create Panel */}
      <motion.div className="card" style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-header">
          <div className="card-title">⚗️ Design New Experiment</div>
          <span className="badge badge-cyan">Auto-Design</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 16, alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">Select Hypothesis</label>
            <select className="form-select" value={form.hypothesis_id} onChange={e => setForm(f => ({ ...f, hypothesis_id: e.target.value }))}>
              <option value="">-- Choose a hypothesis --</option>
              {hypotheses.map(h => (
                <option key={h.id} value={h.id}>{h.hypothesis?.slice(0, 80)}… [{h.status}]</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Methodology (auto if empty)</label>
            <select className="form-select" value={form.methodology} onChange={e => setForm(f => ({ ...f, methodology: e.target.value }))}>
              <option value="">Auto-Select</option>
              {METHODOLOGIES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <motion.button className={`btn btn-primary ${expCreating ? 'btn-loading' : ''}`} onClick={handleCreate} disabled={expCreating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {expCreating ? '⏳ Designing…' : '🔬 Design Experiment'}
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all','designed','running','completed','failed'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'all' ? experiments.length : experiments.filter(e => e.status === t).length})
          </button>
        ))}
      </div>

      {expLoading ? <LoadingCenter message="Loading experiments…" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">🔬</div><div className="empty-state-title">No experiments yet</div><div className="empty-state-desc">Select a hypothesis and design your first experiment</div></div></div>
          ) : filtered.map((exp, i) => (
            <motion.div key={exp.id} className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?.id === exp.id ? null : exp)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <StatusBadge status={exp.status} />
                    <MethodBadge method={exp.methodology} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{exp.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>{exp.objective?.slice(0, 120)}…</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <ScorePill label="Ethical" value={exp.ethical_score} color="#10B981" />
                    <ScorePill label="Reproducibility" value={exp.reproducibility_score} color="#06B6D4" />
                    <ScorePill label="Cost" value={`$${exp.cost_estimate?.toFixed(0)}`} color="#F59E0B" />
                    <ScorePill label="Threshold" value={exp.success_threshold} color="#8B5CF6" />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Time Horizon</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{exp.time_horizon}</div>
                </div>
              </div>

              <AnimatePresence>
                {selected?.id === exp.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                    <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>CONTROL GROUP</div>
                        <div className="card" style={{ padding: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{exp.control_group?.description}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Size: {exp.control_group?.size}</div>
                          <div className="tags" style={{ marginTop: 8 }}>
                            {(exp.control_group?.conditions || []).map(c => <span key={c} className="tag">{c}</span>)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>TEST GROUP</div>
                        <div className="card" style={{ padding: 14, borderColor: 'rgba(139,92,246,0.3)' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{exp.test_group?.description}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Size: {exp.test_group?.size}</div>
                          <div className="tags" style={{ marginTop: 8 }}>
                            {(exp.test_group?.conditions || []).map(c => <span key={c} className="tag">{c}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>METRICS</div>
                      <div className="tags">{(exp.metrics || []).map(m => <span key={m} className="tag">{m}</span>)}</div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>REQUIRED RESOURCES</div>
                      <div className="tags">{(exp.required_resources || []).map(r => <span key={r} className="tag">{r}</span>)}</div>
                    </div>

                    {/* Agent Discussion */}
                    {(exp.agent_discussion || []).length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>AGENT DISCUSSION</div>
                        {exp.agent_discussion.map((d, i) => (
                          <div key={i} className="debate-message">
                            <div className="debate-avatar" style={{ background: 'rgba(139,92,246,0.15)' }}>🤖</div>
                            <div className="debate-content">
                              <div className="debate-agent" style={{ color: 'var(--violet-light)' }}>{d.agent}</div>
                              <div className="debate-text">{d.message}</div>
                              <div className="debate-meta">
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence: {(d.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
