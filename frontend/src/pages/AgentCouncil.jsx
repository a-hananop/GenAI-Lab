import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, CheckCircle2, AlertTriangle, HelpCircle, Scale, MessageSquare, Loader } from 'lucide-react'
import useStore from '../store/useStore'
import { LoadingCenter, ProgressBar } from '../components/UI/index'

export default function AgentCouncil() {
  const { agents, agentDebate, agentDebating, fetchAgents, runDebate, addToast } = useStore()
  const [topic, setTopic] = useState('')
  const [directive, setDirective] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 10000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const handleDebate = async () => {
    if (!topic.trim()) { addToast('Enter a debate topic', 'error'); return }
    addToast('The AI is simulating agent debate…', 'info')
    try {
      await runDebate(topic, directive)
      addToast('Agent debate completed!', 'success')
    } catch (e) { addToast('Debate failed: ' + e, 'error') }
  }

  const voteApprove = agentDebate?.debate_rounds?.filter(r => r.vote === 'approve').length || 0
  const voteReject = agentDebate?.debate_rounds?.filter(r => r.vote === 'reject').length || 0
  const voteAbstain = agentDebate?.debate_rounds?.filter(r => r.vote === 'abstain').length || 0

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title"><motion.span animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ display: 'inline-block', marginRight: 12, color: 'var(--violet-light)' }}><Bot size={32} /></motion.span> Agent Council</div>
        <p className="page-desc">10 specialized AI agents collaborate, debate, and vote on research strategies using advanced AI.</p>
      </div>

      {/* Agent Grid */}
      <div className="agent-grid" style={{ marginBottom: 32 }}>
        {agents.map((agent, i) => (
          <motion.div key={agent.id} className="agent-card"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ borderColor: agent.status === 'active' ? `${agent.color}40` : 'var(--border)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${agent.color}, transparent)`, borderRadius: '20px 20px 0 0' }} />
            <span className="agent-icon">{agent.icon}</span>
            <div className="agent-name" style={{ color: agent.color }}>{agent.name}</div>
            <div className="agent-role">{agent.role}</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Confidence</div>
              <ProgressBar value={agent.confidence} color={agent.color} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="agent-status-indicator">
                <div className={`agent-dot ${agent.status}`} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{agent.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{agent.tasks_completed} tasks</div>
            </div>
          </motion.div>
        ))}
        {agents.length === 0 && Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 180, borderRadius: 20 }} />
        ))}
      </div>

      {/* Debate Panel */}
      <motion.div className="card" style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-header">
          <div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}><MessageSquare size={20} color="#8B5CF6"/> Start Agent Debate</div>
          <span className="badge badge-violet">AI Powered</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '300px' }}>
            <label className="form-label">Debate Topic</label>
            <input className="form-input" placeholder="e.g. Should we prioritize Bayesian optimization over genetic algorithms for this problem?" value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !agentDebating && handleDebate()} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '300px' }}>
            <label className="form-label">Lead Scientist Directive (Optional)</label>
            <input className="form-input" placeholder="e.g. Make sure to consider the ethical implications." value={directive}
              onChange={e => setDirective(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !agentDebating && handleDebate()} />
          </div>
          <motion.button className={`btn btn-primary ${agentDebating ? 'btn-loading' : ''}`} style={{ marginBottom: 16 }} onClick={handleDebate} disabled={agentDebating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {agentDebating ? '⏳ Debating…' : '🗣 Start Debate'}
          </motion.button>
        </div>
      </motion.div>

      {/* Debate Results */}
      {agentDebating && <LoadingCenter message="10 agents are debating via AI…" />}

      {agentDebate && !agentDebating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Vote Summary */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {[
              { label: 'Approve', count: voteApprove, color: '#10B981', icon: <CheckCircle2 size={36} /> },
              { label: 'Reject', count: voteReject, color: '#F43F5E', icon: <AlertTriangle size={36} /> },
              { label: 'Abstain', count: voteAbstain, color: '#94a3b8', icon: <HelpCircle size={36} /> },
            ].map(v => (
              <motion.div key={v.label} style={{ padding: 24, background: `${v.color}12`, border: `1px solid ${v.color}30`, borderRadius: 16, textAlign: 'center' }} whileHover={{ y: -4 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{v.icon}</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: v.color, fontFamily: 'var(--font-mono)' }}>{v.count}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{v.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Consensus Banner */}
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.05)' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 32 }}><Scale size={32} color="var(--violet-light)" /></span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--violet-light)', marginBottom: 6 }}>CONSENSUS ({(agentDebate.confidence_score * 100).toFixed(0)}% confidence)</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>{agentDebate.consensus}</p>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Winning Strategy: <span style={{ color: 'var(--cyan)' }}>{agentDebate.winning_strategy}</span></div>
              </div>
            </div>
          </div>

          {/* Debate Feed */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={20} color="#8B5CF6"/> Debate Feed — Topic: {agentDebate.topic}</div>
            {agentDebate.debate_rounds?.map((r, i) => (
              <motion.div key={i} className="debate-message" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <div className="debate-avatar" style={{ background: `${r.color || '#8B5CF6'}20` }}>
                  <span style={{ fontSize: 18 }}>
                    {agents.find(a => a.name === r.agent)?.icon || '🤖'}
                  </span>
                </div>
                <div className="debate-content">
                  <div className="debate-agent" style={{ color: r.color || 'var(--violet-light)' }}>{r.agent}</div>
                  <div className="debate-text">{r.message}</div>
                  <div className="debate-meta">
                    <span className={`vote-chip vote-${r.vote}`}>{r.vote === 'approve' ? <CheckCircle2 size={12} style={{marginRight: 4}}/> : r.vote === 'reject' ? <AlertTriangle size={12} style={{marginRight: 4}}/> : <HelpCircle size={12} style={{marginRight: 4}}/>} {r.vote}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence: {(r.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
