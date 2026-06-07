import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, Sparkles, CheckCircle2, AlertTriangle, Microscope, Loader } from 'lucide-react'
import useStore from '../store/useStore'
import { RiskBadge, StatusBadge, DomainBadge, ConfidenceBar, LoadingCenter } from '../components/UI/index'

const DOMAINS = ['general','machine_learning','neuroscience','economics','biology','physics',
  'climate_science','drug_discovery','behavioral_science','materials_science','quantum_computing','robotics','epidemiology']

export default function HypothesisLab() {
  const { hypotheses, hypLoading, hypGenerating, fetchHypotheses, generateHypothesis, approveHypothesis, rejectHypothesis, createExperiment, addToast } = useStore()
  const [form, setForm] = useState({ domain: 'general', topic: '', context: '' })
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchHypotheses() }, [])

  const handleGenerate = async () => {
    try {
      addToast('The AI is generating hypothesis…', 'info')
      const h = await generateHypothesis(form)
      addToast('New hypothesis generated!', 'success')
    } catch (e) { addToast('Generation failed: ' + e, 'error') }
  }

  const handleApprove = async (id) => {
    await approveHypothesis(id)
    addToast('Hypothesis approved ✅', 'success')
  }

  const handleReject = async (id) => {
    await rejectHypothesis(id)
    addToast('Hypothesis rejected', 'error')
  }

  const handleDesignExp = async (hypId) => {
    try {
      addToast('Designing experiment…', 'info')
      await createExperiment({ hypothesis_id: hypId })
      addToast('Experiment designed! Check Experiment Center.', 'success')
    } catch (e) { addToast('Failed: ' + e, 'error') }
  }

  const filtered = filter === 'all' ? hypotheses : hypotheses.filter(h => h.status === filter)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title"><motion.span animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ display: 'inline-block', marginRight: 12, color: 'var(--violet-light)' }}><Dna size={32} /></motion.span> Hypothesis Lab</div>
        <p className="page-desc">Generate novel scientific hypotheses powered by advanced AI. Each hypothesis is evaluated by 10 specialized agents.</p>
      </div>

      {/* Generator Panel */}
      <motion.div className="card" style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-header">
          <div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}><Sparkles size={20} color="#EAB308"/> Generate New Hypothesis</div>
        </div>
        <div className="hyp-form-grid">
          <div className="form-group">
            <label className="form-label">Research Domain</label>
            <select className="form-select" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}>
              {DOMAINS.map(d => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Specific Topic (optional)</label>
            <input className="form-input" placeholder="e.g. transformer attention mechanisms" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Additional Context (optional)</label>
            <input className="form-input" placeholder="e.g. focus on efficiency improvements" value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} />
          </div>
        </div>
        <motion.button className={`btn btn-primary ${hypGenerating ? 'btn-loading' : ''}`} style={{display: 'flex', alignItems: 'center', gap: 8}} onClick={handleGenerate} disabled={hypGenerating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {hypGenerating ? <><Loader size={18} className="spin" /> Generating with AI…</> : <><Dna size={18} /> Generate Hypothesis</>}
        </motion.button>
      </motion.div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all','pending','approved','rejected','testing','validated'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${hypotheses.length})` : `(${hypotheses.filter(h => h.status === f).length})`}
          </button>
        ))}
      </div>

      {hypLoading ? <LoadingCenter message="Fetching hypotheses…" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon" style={{color: 'var(--text-muted)'}}><Dna size={32} /></div>
                <div className="empty-state-title">No hypotheses yet</div>
                <div className="empty-state-desc">Click "Generate Hypothesis" to create your first AI-powered research hypothesis</div>
              </div>
            </div>
          ) : filtered.map((h, i) => (
            <motion.div key={h.id} className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?.id === h.id ? null : h)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <StatusBadge status={h.status} />
                    <RiskBadge level={h.risk_level} />
                    <DomainBadge domain={h.domain} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                      ID: {h.id?.slice(0, 8)}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.5 }}>{h.hypothesis}</p>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Confidence</div>
                    <ConfidenceBar value={h.confidence} />
                  </div>
                  <div className="tags">
                    {(h.variables || []).slice(0, 4).map(v => <span key={v} className="tag">{v}</span>)}
                  </div>
                </div>
                {h.status === 'pending' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-success btn-sm" style={{display: 'flex', alignItems: 'center', gap: 6}} onClick={() => handleApprove(h.id)}><CheckCircle2 size={14} /> Approve</button>
                    <button className="btn btn-danger btn-sm" style={{display: 'flex', alignItems: 'center', gap: 6}} onClick={() => handleReject(h.id)}><AlertTriangle size={14} /> Reject</button>
                    <button className="btn btn-secondary btn-sm" style={{display: 'flex', alignItems: 'center', gap: 6}} onClick={() => handleDesignExp(h.id)}><Microscope size={14} /> Design Exp</button>
                  </div>
                )}
                {h.status === 'approved' && (
                  <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => { e.stopPropagation(); handleDesignExp(h.id) }}><Microscope size={14} /> Design Exp</button>
                )}
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {selected?.id === h.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                    <div className="grid-2" style={{ gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>PREDICTED OUTCOME</div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{h.predicted_outcome}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>SCIENTIFIC REASONING</div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{h.reasoning}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>PRIOR EVIDENCE</div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{h.prior_evidence || 'None provided'}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>ESTIMATED VALUE</div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{h.estimated_value}</p>
                      </div>
                    </div>
                    {/* Agent Votes */}
                    {h.agent_votes && Object.keys(h.agent_votes).length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>AGENT VOTES</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {Object.entries(h.agent_votes).map(([agent, vote]) => (
                            <div key={agent} style={{ padding: '6px 12px', borderRadius: 8, background: vote.vote === 'approve' ? 'rgba(16,185,129,0.1)' : vote.vote === 'reject' ? 'rgba(244,63,94,0.1)' : 'rgba(148,163,184,0.1)', border: `1px solid ${vote.vote === 'approve' ? 'rgba(16,185,129,0.3)' : vote.vote === 'reject' ? 'rgba(244,63,94,0.3)' : 'rgba(148,163,184,0.2)'}` }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: vote.vote === 'approve' ? '#10B981' : vote.vote === 'reject' ? '#F43F5E' : '#94a3b8' }}>{agent}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{vote.vote} · {(vote.confidence * 100).toFixed(0)}%</div>
                            </div>
                          ))}
                        </div>
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
