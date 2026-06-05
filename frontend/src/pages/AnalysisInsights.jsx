import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Search, TrendingUp, Target, Link as LinkIcon, Brain, Lightbulb, Rocket, CheckCircle2, AlertTriangle, Loader } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import useStore from '../store/useStore'
import { analysisAPI } from '../services/api'
import { LoadingCenter, ProgressBar } from '../components/UI/index'

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

  const meanChartData = analysis ? [
    { name: 'Control Group', mean: stat?.control_mean },
    { name: 'Treatment Group', mean: stat?.treatment_mean }
  ] : []

  const featureChartData = analysis?.feature_importance?.map(f => ({
    name: f.variable,
    importance: parseFloat((f.importance * 100).toFixed(1))
  })) || []

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title"><motion.span animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ display: 'inline-block', marginRight: 12, color: 'var(--violet-light)' }}><BarChart2 size={32} /></motion.span> Analysis & Insights</div>
        <p className="page-desc">Statistical analysis, causal inference, XAI explanations and actionable recommendations.</p>
      </div>

      <motion.div className="card" style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-header"><div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}><Search size={20} color="#8B5CF6"/> Analyze Experiment</div></div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Select Experiment</label>
            <select className="form-select" value={selectedExp} onChange={e => setSelectedExp(e.target.value)}>
              <option value="">-- Choose experiment --</option>
              {experiments.map(e => <option key={e.id} value={e.id}>{e.name} [{e.status}]</option>)}
            </select>
          </div>
          <motion.button className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} style={{display: 'flex', alignItems: 'center', gap: 8}} onClick={handleAnalyze} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {loading ? <><Loader size={18} className="spin" /> Analyzing…</> : <><BarChart2 size={18} /> Run Analysis</>}
          </motion.button>
        </div>
      </motion.div>

      {loading && <LoadingCenter message="Running statistical analysis with XAI…" />}

      {analysis && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Result Banner */}
          <div style={{ padding: '20px 24px', borderRadius: 16, background: analysis.success ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', border: `1px solid ${analysis.success ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36, display: 'flex' }}>{analysis.success ? <CheckCircle2 size={36} color="#10B981" /> : <AlertTriangle size={36} color="#F43F5E" />}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{analysis.experiment_name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Methodology: {analysis.methodology} · {analysis.success ? 'Statistically significant result' : 'Below significance threshold'}</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Stats Overview */}
            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, padding: 24 }}>
              {[
                { label: 'Control Mean', value: stat?.control_mean, color: '#475569' },
                { label: 'Treatment Mean', value: stat?.treatment_mean, color: '#8B5CF6' },
                { label: 'P-Value', value: stat?.p_value, color: stat?.p_value < 0.05 ? '#10B981' : '#F43F5E' },
                { label: 'Effect Size', value: `${stat?.effect_size} (${stat?.effect_size_label})`, color: '#06B6D4' },
                { label: 'T-Statistic', value: stat?.t_statistic, color: '#F59E0B' },
                { label: 'Sample Size', value: stat?.sample_size, color: '#3B82F6' },
              ].map((s, i) => (
                <motion.div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{typeof s.value === 'number' ? s.value.toFixed(4) : s.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Mean Comparison Chart */}
            <div className="card">
               <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={20} color="#8B5CF6"/> Mean Comparison</div>
               <div style={{ height: 220, width: '100%' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={meanChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                     <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                     <Bar dataKey="mean" radius={[4, 4, 0, 0]} animationDuration={1500} animationEasing="ease-out">
                       {meanChartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 0 ? '#475569' : '#8B5CF6'} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Feature Importance Radar Chart */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={20} color="#06B6D4"/> Feature Importance Breakdown</div>
              <div style={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={featureChartData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <Radar name="Importance (%)" dataKey="importance" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.4} animationDuration={2000} animationEasing="ease-in-out" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Causal Inference */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><LinkIcon size={20} color="#F59E0B"/> Causal Inference</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Causal Direction', value: analysis.causal_inference?.causal_direction },
                  { label: 'Causal Strength', value: `${((analysis.causal_inference?.causal_strength || 0) * 100).toFixed(1)}%` },
                  { label: 'Confounders Detected', value: analysis.causal_inference?.confounders_detected },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--violet-light)' }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>DAG Nodes</div>
                  <div className="tags">{(analysis.causal_inference?.dag_nodes || []).map(n => <span key={n} className="tag">{n}</span>)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* XAI Explanation */}
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(139,92,246,0.3)' }}>
            <div className="card-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Brain size={20} color="#A855F7"/> XAI Explanation (AI)</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{analysis.explainability}</p>
          </div>

          {/* Recommendations */}
          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Lightbulb size={20} color="#EAB308"/> Recommendations</div>
              {analysis.recommendations?.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--emerald)', flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Rocket size={20} color="#F43F5E"/> Next Actions</div>
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
          <div className="empty-state-icon" style={{color: 'var(--text-muted)'}}><BarChart2 size={32} /></div>
          <div className="empty-state-title">Select an experiment to analyze</div>
          <div className="empty-state-desc">Get statistical analysis, causal inference, XAI explanations and recommendations</div>
        </div></div>
      )}
    </div>
  )
}
