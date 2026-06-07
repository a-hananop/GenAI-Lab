import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Dna, Microscope, Zap, CheckCircle, Brain, Coins, DollarSign, TrendingUp, Globe, Settings, RefreshCw, AlertTriangle, Telescope, CheckCircle2, Rocket, Loader } from 'lucide-react'
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
        className="hero-banner"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Telescope size={28} color="#8B5CF6" /> Autonomous AI Research Laboratory
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 500 }}>
              GenAI Lab continuously generates hypotheses, designs experiments, runs simulations, and improves itself using advanced AI + 10 specialized agents.
            </p>
          </div>
          <div className="hero-actions">
            <motion.button
              className={`btn btn-primary btn-lg ${loopRunning ? 'btn-loading' : ''}`}
              onClick={handleLoop} disabled={loopRunning} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{display: 'flex', alignItems: 'center', gap: 8}}
            >
              {loopRunning ? <><Loader size={18} className="spin" /> Running Loop…</> : <><Rocket size={18} /> Trigger Research Loop</>}
            </motion.button>
            <Link to="/hypotheses" className="btn btn-secondary btn-lg" style={{display: 'flex', alignItems: 'center', gap: 8}}><Dna size={18} /> Generate Hypothesis</Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="stat-grid" style={{ marginBottom: 32 }} variants={container} initial="hidden" animate="show">
        {[
          { icon: <Dna size={22} />, label: 'Total Hypotheses', value: stats?.total_hypotheses || 0, color: '#8B5CF6', gradient: 'linear-gradient(90deg, #8B5CF6, #A855F7)' },
          { icon: <Microscope size={22} />, label: 'Experiments Designed', value: stats?.total_experiments || 0, color: '#06B6D4', gradient: 'linear-gradient(90deg, #06B6D4, #0EA5E9)' },
          { icon: <Zap size={22} />, label: 'Simulations Run', value: stats?.total_simulations || 0, color: '#F59E0B', gradient: 'linear-gradient(90deg, #F59E0B, #EF4444)' },
          { icon: <CheckCircle size={22} />, label: 'Success Rate', value: `${stats?.success_rate || 0}%`, color: '#10B981', gradient: 'linear-gradient(90deg, #10B981, #06B6D4)' },
          { icon: <Brain size={22} />, label: 'Memories Stored', value: stats?.total_memories || 0, color: '#A855F7', gradient: 'linear-gradient(90deg, #A855F7, #EC4899)' },
          { icon: <Coins size={22} />, label: 'Total Tokens', value: `${(stats?.total_tokens || 0).toLocaleString()}`, color: '#EAB308', gradient: 'linear-gradient(90deg, #EAB308, #FACC15)' },
          { icon: <DollarSign size={22} />, label: 'Est. API Cost', value: `$${stats?.estimated_cost?.toFixed(2) || '0.00'}`, color: '#F43F5E', gradient: 'linear-gradient(90deg, #F43F5E, #FB923C)' },
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
              <div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}><TrendingUp size={20} color="#8B5CF6"/> Confidence Evolution</div>
              <div className="card-subtitle">Hypothesis confidence over time</div>
            </div>
          </div>
          <ConfidenceChart data={stats?.confidence_evolution || []} />
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}><Globe size={20} color="#06B6D4"/> Research Domains</div>
              <div className="card-subtitle">Hypothesis distribution by domain</div>
            </div>
          </div>
          <DomainChart data={stats?.domain_distribution || []} />
        </motion.div>
      </div>

      {/* System Health + Loop History */}
      <div className="grid-2">
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="card-header"><div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}><Settings size={20} color="#10B981"/> System Health</div></div>
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
            <div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}><RefreshCw size={20} color="#F43F5E"/> Research Loop History</div>
            <Link to="/experiments" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {loopHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{color: 'var(--text-muted)'}}><RefreshCw size={32} /></div>
              <div className="empty-state-title">No loops run yet</div>
              <div className="empty-state-desc">Trigger a research loop to start autonomous experimentation</div>
            </div>
          ) : loopHistory.slice(0, 5).map((l, i) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: l.outcome === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: l.outcome === 'success' ? '#10B981' : '#F43F5E' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
                  {l.outcome === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                </motion.div>
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
