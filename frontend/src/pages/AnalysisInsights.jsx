import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import { analysisAPI } from '../services/api'
import { LoadingCenter, ProgressBar } from '../components/UI/index'
import { ConvergenceChart } from '../components/Charts/index'

export default function AnalysisInsights() {
  const { experiments, fetchExperiments, addToast } = useStore()
  const [selectedExp, setSelectedExp] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchExperiments() }, [])

  const handleAnalyze = async () => {
    if (!selectedExp) { addToast('Select an experiment', 'error'); return }
    setLoading(true)
    try {
      const data = await analysisAPI.get(selectedExp)
      setAnalysis(data)
    } catch (e) { addToast('Analysis failed: ' + e, 'error') }
    finally { setLoading(false) }
  }

  const stat = analysis?.statistical_analysis

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title"><span className="page-title-icon">📊</span> Analysis & Insights</div>
        <p className="page-desc">Statistical analysis, causal inference, XAI explanations and actionable recommendations.</p>
      </div>

      <motion.div className="card" style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-header"><div className="card-title">🔍 Analyze Experiment</div></div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Select Experiment</label>
            <select className="form-select" value={selectedExp} onChange={e => setSelectedExp(e.target.value)}>
              <option value="">-- Choose experiment --</option>
              {experiments.map(e => <option key={e.id} value={e.id}>{e.name} [{e.status}]</option>)}
            </select>
          </div>
          <motion.button className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} onClick={handleAnalyze} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {loading ? '⏳ Analyzing…' : '📊 Run Analysis'}
          </motion.button>
        </div>
      </motion.div>

      {loading && <LoadingCenter message="Running statistical analysis with Gemini XAI…" />}

      {analysis && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Result Banner */}
          <div style={{ padding: '20px 24px', borderRadius: 16, background: analysis.success ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', border: `1px solid ${analysis.success ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36 }}>{analysis.success ? '✅' : '⚠️'}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{analysis.experiment_name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Methodology: {analysis.methodology} · {analysis.success ? 'Statistically significant result' : 'Below significance threshold'}</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Control Mean', value: stat?.control_mean, color: '#475569' },
              { label: 'Treatment Mean', value: stat?.treatment_mean, color: '#8B5CF6' },
              { label: 'P-Value', value: stat?.p_value, color: stat?.p_value < 0.05 ? '#10B981' : '#F43F5E' },
              { label: 'Effect Size', value: `${stat?.effect_size} (${stat?.effect_size_label})`, color: '#06B6D4' },
              { label: 'T-Statistic', value: stat?.t_statistic, color: '#F59E0B' },
              { label: 'Sample Size', value: stat?.sample_size, color: '#3B82F6' },
              { label: 'CI 95% Lower', value: stat?.confidence_interval_95?.[0], color: '#A855F7' },
              { label: 'CI 95% Upper', value: stat?.confidence_interval_95?.[1], color: '#A855F7' },
            ].map((s, i) => (
              <motion.div key={i} style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{typeof s.value === 'number' ? s.value.toFixed(4) : s.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Feature Importance */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>📌 Feature Importance</div>
              {analysis.feature_importance?.map((f, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{f.variable}</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--violet-light)' }}>{(f.importance * 100).toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={f.importance} />
                </div>
              ))}
            </div>

            {/* Causal Inference */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>🔗 Causal Inference</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Causal Direction', value: analysis.causal_inference?.causal_direction },
                  { label: 'Causal Strength', value: `${((analysis.causal_inference?.causal_strength || 0) * 100).toFixed(1)}%` },
                  { label: 'Confounders Detected', value: analysis.causal_inference?.confounders_detected },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--violet-light)' }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>DAG Nodes</div>
                  <div className="tags">{(analysis.causal_inference?.dag_nodes || []).map(n => <span key={n} className="tag">{n}</span>)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* XAI Explanation */}
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(139,92,246,0.3)' }}>
            <div className="card-title" style={{ marginBottom: 12 }}>🧠 XAI Explanation (Gemini)</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{analysis.explainability}</p>
          </div>

          {/* Recommendations */}
          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>💡 Recommendations</div>
              {analysis.recommendations?.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--emerald)', flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>🚀 Next Actions</div>
              {analysis.next_actions?.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--violet-light)', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!analysis && !loading && (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">Select an experiment to analyze</div>
          <div className="empty-state-desc">Get statistical analysis, causal inference, XAI explanations and recommendations</div>
        </div></div>
      )}
    </div>
  )
}
