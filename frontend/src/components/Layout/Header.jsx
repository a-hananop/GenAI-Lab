import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import { LayoutDashboard, Dna, FlaskConical, Zap, BarChart3, Bot, Database, FileText, BrainCircuit, Activity, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

const PAGE_META = {
  '/': { title: 'Dashboard', desc: 'System overview & live metrics', icon: <LayoutDashboard size={24} /> },
  '/hypotheses': { title: 'Hypothesis Lab', desc: 'Generate & manage scientific hypotheses', icon: <Dna size={24} /> },
  '/experiments': { title: 'Experiment Center', desc: 'Design & track experiments', icon: <FlaskConical size={24} /> },
  '/simulations': { title: 'Simulation Runner', desc: 'Execute & monitor simulations in real-time', icon: <Zap size={24} /> },
  '/analysis': { title: 'Analysis & Insights', desc: 'Statistical analysis & explainability', icon: <BarChart3 size={24} /> },
  '/agents': { title: 'Agent Council', desc: '10 specialized AI agents collaborating', icon: <Bot size={24} /> },
  '/memory': { title: 'Memory Vault', desc: 'Long-term research memory & knowledge graph', icon: <Database size={24} /> },
  '/reports': { title: 'Research Reports', desc: 'AI-generated research summaries', icon: <FileText size={24} /> },
}

export default function Header() {
  const location = useLocation()
  const toasts = useStore(s => s.toasts)
  const removeToast = useStore(s => s.removeToast)
  const meta = PAGE_META[location.pathname] || { title: 'GenAI Lab', desc: '', icon: <Activity size={24} /> }

  return (
    <>
      <header className="header">
        <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--violet-light)', display: 'flex' }}>{meta.icon}</div>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{meta.title}</h1>
            <p>{meta.desc}</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="header-badge" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: 'var(--emerald)' }}>
            <BrainCircuit size={14} /> Neural Engine Active
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* Toast Container */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.8 }}
              className={`alert alert-${t.type === 'success' ? 'success' : t.type === 'error' ? 'error' : 'info'}`}
              style={{ minWidth: 280, maxWidth: 400, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              onClick={() => removeToast(t.id)}
            >
              <span>{t.type === 'success' ? <CheckCircle2 size={16} /> : t.type === 'error' ? <AlertTriangle size={16} /> : <Info size={16} />}</span>
              <span>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
