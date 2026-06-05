import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Dna, FlaskConical, Zap, BarChart3, Bot, Database, FileText, Atom, X } from 'lucide-react'
import useStore from '../../store/useStore'

const NAV = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', section: 'CORE' },
  { to: '/hypotheses', icon: <Dna size={18} />, label: 'Hypothesis Lab', section: 'RESEARCH' },
  { to: '/experiments', icon: <FlaskConical size={18} />, label: 'Experiment Center', section: 'RESEARCH' },
  { to: '/simulations', icon: <Zap size={18} />, label: 'Simulation Runner', section: 'RESEARCH' },
  { to: '/analysis', icon: <BarChart3 size={18} />, label: 'Analysis & Insights', section: 'ANALYSIS' },
  { to: '/agents', icon: <Bot size={18} />, label: 'Agent Council', section: 'AGENTS' },
  { to: '/memory', icon: <Database size={18} />, label: 'Memory Vault', section: 'MEMORY' },
  { to: '/reports', icon: <FileText size={18} />, label: 'Research Reports', section: 'OUTPUT' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const loopRunning = useStore(s => s.loopRunning)
  const location = useLocation()

  const sections = [...new Set(NAV.map(n => n.section))]

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            style={{ display: 'flex' }}
          >
            <Atom size={26} color="white" />
          </motion.div>
        </div>
        <div className="sidebar-logo-text">
          <h2>GenAI Lab</h2>
          <span>v1.0.0 · Autonomous</span>
        </div>
        <button className="mobile-menu-btn btn-icon btn-ghost" onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto', border: 'none' }}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {NAV.filter(n => n.section === section).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status" style={{ marginBottom: '6px' }}>
          <div className="status-dot" style={{ background: '#10B981', boxShadow: '0 0 10px rgba(16,185,129,0.6)' }} />
          <span style={{ fontWeight: 500 }}>All systems online</span>
        </div>
        <div className="system-status" style={{ marginBottom: '12px' }}>
          <div className="status-dot" style={{ 
            background: loopRunning ? '#8B5CF6' : '#F59E0B', 
            boxShadow: loopRunning ? '0 0 10px rgba(139,92,246,0.8)' : 'none',
            animation: loopRunning ? 'pulse-dot 1.5s infinite' : 'none'
          }} />
          <span style={{ fontWeight: 500, color: loopRunning ? 'var(--violet-light)' : 'var(--text-muted)' }}>
            {loopRunning ? 'Research loop running…' : 'Loop standby'}
          </span>
        </div>
        <div style={{ 
          fontSize: 11, 
          color: 'var(--text-muted)', 
          fontFamily: 'var(--font-mono)', 
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}>
          Core AI Online
        </div>
      </div>
    </aside>
    </>
  )
}
