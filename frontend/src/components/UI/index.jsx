import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

// ===== CONFIDENCE BAR =====
export function ConfidenceBar({ value, showLabel = true }) {
  const pct = Math.min(100, Math.max(0, value))
  const color = pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F43F5E'
  return (
    <div className="confidence-meter">
      <div className="confidence-track" style={{ flex: 1 }}>
        <motion.div
          className="confidence-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && <span className="confidence-value" style={{ color }}>{pct.toFixed(0)}%</span>}
    </div>
  )
}

// ===== RISK BADGE =====
export function RiskBadge({ level }) {
  const map = { low: 'emerald', medium: 'amber', high: 'rose', critical: 'rose' }
  return <span className={`badge badge-${map[level] || 'gray'}`}>{level || 'unknown'}</span>
}

// ===== STATUS BADGE =====
export function StatusBadge({ status }) {
  const map = {
    pending: 'gray', approved: 'emerald', rejected: 'rose', testing: 'cyan',
    validated: 'violet', refuted: 'rose', designed: 'blue', running: 'amber',
    completed: 'emerald', failed: 'rose', paused: 'gray',
  }
  return <span className={`badge badge-${map[status] || 'gray'}`}>{status}</span>
}

// ===== METHOD BADGE =====
export function MethodBadge({ method }) {
  const colors = ['violet', 'cyan', 'emerald', 'amber', 'blue', 'pink', 'teal']
  const idx = method?.length % colors.length || 0
  return <span className={`badge badge-${colors[idx]}`}>{method}</span>
}

// ===== STAT CARD =====
export function StatCard({ icon, label, value, change, color = '#8B5CF6', gradient }) {
  return (
    <motion.div
      className="stat-card"
      style={{ '--accent-gradient': gradient || `linear-gradient(90deg, ${color}, #06B6D4)` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="stat-icon" style={{ background: `${color}22` }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {change !== undefined && (
        <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </motion.div>
  )
}

// ===== LOADING SPINNER =====
export function Spinner({ size = 40, color = '#8B5CF6' }) {
  return (
    <div style={{ width: size, height: size, border: `3px solid ${color}22`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  )
}

// ===== LOADING CENTER =====
export function LoadingCenter({ message = 'Loading…' }) {
  return (
    <div className="loading-center">
      <Spinner />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{message}</p>
    </div>
  )
}

// ===== PROGRESS BAR =====
export function ProgressBar({ value, color }) {
  return (
    <div className="progress-bar">
      <motion.div
        className="progress-fill"
        style={{ background: color || 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value * 100)}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

// ===== ANIMATED COUNTER =====
export function AnimatedCounter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0; const end = Number(value) || 0
    const dur = 1000; const step = 16
    const inc = (end - start) / (dur / step)
    const timer = setInterval(() => {
      start += inc
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}{suffix}</span>
}

// ===== DOMAIN BADGE =====
export function DomainBadge({ domain }) {
  const colorMap = {
    machine_learning: 'violet', neuroscience: 'pink', economics: 'amber',
    biology: 'emerald', physics: 'blue', climate_science: 'teal',
    drug_discovery: 'rose', behavioral_science: 'cyan', materials_science: 'orange',
    quantum_computing: 'violet', robotics: 'amber', epidemiology: 'emerald', general: 'gray',
  }
  return <span className={`badge badge-${colorMap[domain] || 'gray'}`}>{domain?.replace(/_/g, ' ')}</span>
}

// ===== SCORE PILL =====
export function ScorePill({ label, value, color = '#8B5CF6' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: `${color}15`, borderRadius: 8, border: `1px solid ${color}30` }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
        {typeof value === 'number' && value < 2 ? (value * 100).toFixed(0) + '%' : value}
      </span>
    </div>
  )
}
