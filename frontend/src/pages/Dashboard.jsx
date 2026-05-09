import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'
import { StatCard, AnimatedCounter, LoadingCenter } from '../components/UI/index'
import { ConfidenceChart, DomainChart } from '../components/Charts/index'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Dashboard() {
  const { stats, statsLoading, fetchStats, triggerLoop, loopRunning, loopHistory, fetchLoopHistory, addToast } = useStore()

  useEffect(() => { fetchStats(); fetchLoopHistory() }, [])

  const handleLoop = async () => {
    try {
      addToast('Autonomous research loop started…', 'info')
      const result = await triggerLoop()
      addToast(`Loop #${result.loop_number} completed — ${result.outcome}!`, result.outcome === 'success' ? 'success' : 'error')
      fetchStats()
    } catch (e) { addToast('Loop failed: ' + e, 'error') }
  }

  if (statsLoading && !stats) return <LoadingCenter message="Loading GenAI Lab dashboard…" />

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <motion.div
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 20, padding: '32px 36px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
              🔭 Autonomous AI Research Laboratory
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 500 }}>
              GenAI Lab continuously generates hypotheses, designs experiments, runs simulations, and improves itself using Gemini AI + 10 specialized agents.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <motion.button
              className={`btn btn-primary btn-lg ${loopRunning ? 'btn-loading' : ''}`}
              onClick={handleLoop} disabled={loopRunning} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              {loopRunning ? '⏳ Running Loop…' : '🚀 Trigger Research Loop'}
            </motion.button>
            <Link to="/hypotheses" className="btn btn-secondary btn-lg">🧬 Generate Hypothesis</Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="stat-grid" style={{ marginBottom: 32 }} variants={container} initial="hidden" animate="show">
        {[
          { icon: '🧬', label: 'Total Hypotheses', value: stats?.total_hypotheses || 0, color: '#8B5CF6', gradient: 'linear-gradient(90deg, #8B5CF6, #A855F7)' },
          { icon: '🔬', label: 'Experiments Designed', value: stats?.total_experiments || 0, color: '#06B6D4', gradient: 'linear-gradient(90deg, #06B6D4, #0EA5E9)' },
          { icon: '⚡', label: 'Simulations Run', value: stats?.total_simulations || 0, color: '#F59E0B', gradient: 'linear-gradient(90deg, #F59E0B, #EF4444)' },
          { icon: '✅', label: 'Success Rate', value: `${stats?.success_rate || 0}%`, color: '#10B981', gradient: 'linear-gradient(90deg, #10B981, #06B6D4)' },
          { icon: '🧠', label: 'Memories Stored', value: stats?.total_memories || 0, color: '#A855F7', gradient: 'linear-gradient(90deg, #A855F7, #EC4899)' },
          { icon: '🪙', label: 'Total Tokens', value: `${(stats?.total_tokens || 0).toLocaleString()}`, color: '#EAB308', gradient: 'linear-gradient(90deg, #EAB308, #FACC15)' },
          { icon: '💸', label: 'Est. API Cost', value: `$${stats?.estimated_cost?.toFixed(2) || '0.00'}`, color: '#F43F5E', gradient: 'linear-gradient(90deg, #F43F5E, #FB923C)' },
        ].map((s, i) => (
          <motion.div key={i} variants={item}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 32 }}>
        <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="card-header">
            <div>
              <div className="card-title">📈 Confidence Evolution</div>
              <div className="card-subtitle">Hypothesis confidence over time</div>
            </div>
          </div>
          <ConfidenceChart data={stats?.confidence_evolution || []} />
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="card-header">
            <div>
              <div className="card-title">🌐 Research Domains</div>
              <div className="card-subtitle">Hypothesis distribution by domain</div>
            </div>
          </div>
          <DomainChart data={stats?.domain_distribution || []} />
        </motion.div>
      </div>

      {/* System Health + Loop History */}
      <div className="grid-2">
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="card-header"><div className="card-title">⚙️ System Health</div></div>
          {Object.entries(stats?.system_health || {}).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', display: 'inline-block' }} />
                {v}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="card-header">
            <div className="card-title">🔄 Research Loop History</div>
            <Link to="/experiments" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {loopHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔄</div>
              <div className="empty-state-title">No loops run yet</div>
              <div className="empty-state-desc">Trigger a research loop to start autonomous experimentation</div>
            </div>
          ) : loopHistory.slice(0, 5).map((l, i) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: l.outcome === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {l.outcome === 'success' ? '✅' : '⚠️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Loop #{l.loop_number}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.insights?.slice(0, 60)}…</div>
              </div>
              <span className={`badge badge-${l.outcome === 'success' ? 'emerald' : 'rose'}`}>{l.outcome}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
