import { useState } from 'react'
import { motion } from 'framer-motion'
import { reportsAPI } from '../services/api'
import { LoadingCenter } from '../components/UI/index'
import useStore from '../store/useStore'

export default function ResearchReports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const { addToast } = useStore()

  const handleGenerate = async () => {
    setLoading(true)
    try {
      addToast('Gemini is generating your research report…', 'info')
      const data = await reportsAPI.generate()
      setReport(data)
      addToast('Report generated!', 'success')
    } catch (e) { addToast('Report generation failed: ' + e, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title"><span className="page-title-icon">📄</span> Research Reports</div>
        <p className="page-desc">AI-generated research reports summarizing hypotheses, experiments, and findings using Gemini.</p>
      </div>

      <motion.div className="card" style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title">📄 Generate Research Report</div>
            <div className="card-subtitle">Gemini AI synthesizes all research data into a structured report</div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`} onClick={handleGenerate} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {loading ? '⏳ Generating…' : '📄 Generate Report'}
            </motion.button>
            {report && (
              <motion.button className="btn btn-ghost btn-lg" onClick={() => window.print()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                🖨️ Export PDF
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {loading && <LoadingCenter message="Gemini is analyzing all research data and generating report…" />}

      {report && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ padding: '20px 28px', background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.06))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, marginBottom: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>📄 {report.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generated: {new Date(report.generated_at).toLocaleString()} · Period: {report.period}</div>
          </div>

          <div className="grid-4" style={{ marginBottom: 28 }}>
            {[
              { label: 'Hypotheses', value: report.statistics?.total_hypotheses, color: '#8B5CF6', icon: '🧬' },
              { label: 'Experiments', value: report.statistics?.total_experiments, color: '#06B6D4', icon: '🔬' },
              { label: 'Simulations', value: report.statistics?.completed_simulations, color: '#10B981', icon: '⚡' },
              { label: 'Approval Rate', value: `${report.statistics?.approval_rate}%`, color: '#F59E0B', icon: '✅' },
            ].map((s, i) => (
              <motion.div key={i} style={{ padding: 20, background: 'var(--bg-card)', border: `1px solid ${s.color}30`, borderRadius: 16 }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 28 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>🧬 Top Hypotheses</div>
              {report.top_hypotheses?.map((h, i) => (
                <div key={h.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span className="badge badge-violet">{h.domain?.replace(/_/g,' ')}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{h.confidence?.toFixed(1)}% confidence</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{h.hypothesis}</p>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>🔬 Recent Experiments</div>
              {report.recent_experiments?.map((e, i) => (
                <div key={e.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.methodology}</div>
                  </div>
                  <span className={`badge badge-${e.status === 'completed' ? 'emerald' : e.status === 'running' ? 'amber' : 'gray'}`}>{e.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
            <div className="card-title" style={{ marginBottom: 16 }}>🤖 AI Research Narrative (Gemini)</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{report.narrative}</div>
          </div>
        </motion.div>
      )}

      {!report && !loading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">No report generated yet</div>
            <div className="empty-state-desc">Click "Generate Report" to create an AI-powered research summary of all your lab activity</div>
          </div>
        </div>
      )}
    </div>
  )
}
