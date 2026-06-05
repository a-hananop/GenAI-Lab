import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import { LoadingCenter, ProgressBar, StatusBadge } from '../components/UI/index'
import { ConvergenceChart } from '../components/Charts/index'

import { Dices, FunctionSquare, Dna, BrainCircuit, Scale, Zap, Rocket, Download, Play, CheckCircle2, AlertTriangle, Loader, ClipboardList } from 'lucide-react'

const SIM_TYPES = [
  { id:'monte_carlo', name:'Monte Carlo', icon: <Dices size={24} />, desc:'Random sampling convergence analysis', color:'#8B5CF6' },
  { id:'bayesian', name:'Bayesian Optimization', icon: <FunctionSquare size={24} />, desc:'Gaussian Process surrogate model', color:'#06B6D4' },
  { id:'genetic_algorithm', name:'Genetic Algorithm', icon: <Dna size={24} />, desc:'Evolutionary population optimization', color:'#10B981' },
  { id:'reinforcement_learning', name:'Reinforcement Learning', icon: <BrainCircuit size={24} />, desc:'Q-learning reward optimization', color:'#F59E0B' },
  { id:'ab_test', name:'A/B Test', icon: <Scale size={24} />, desc:'Two-group statistical comparison', color:'#3B82F6' },
  { id:'multi_arm_bandit', name:'Multi-Arm Bandit', icon: <Zap size={24} />, desc:'Exploration-exploitation strategy', color:'#EC4899' },
]

export default function SimulationRunner() {
  const { simulations, simLoading, simRunning, fetchSimulations, runSimulation, experiments, fetchExperiments, addToast } = useStore()
  const [form, setForm] = useState({ experiment_id: '', sim_type: 'monte_carlo', iterations: 500 })
  const [liveData, setLiveData] = useState([])
  const [progress, setProgress] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => { fetchSimulations(); fetchExperiments() }, [])

  const downloadCSV = () => {
    if (!simulations || simulations.length === 0) {
      addToast('No simulations to export', 'error');
      return;
    }
    const headers = ['ID', 'Type', 'Experiment ID', 'Iterations', 'Status', 'Success', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...simulations.map(s => [
        s.id,
        s.sim_type,
        s.experiment_id,
        s.iterations,
        s.status,
        s.results?.success || false,
        s.created_at
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `simulations_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV Downloaded!', 'success');
  };

  const runWithWS = (expId, simType, iters) => {
    return new Promise((resolve, reject) => {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      let wsUrl = '';
      if (apiUrl && apiUrl.startsWith('http')) {
        // Convert http://... to ws://... or https://... to wss://...
        wsUrl = apiUrl.replace(/^http/, 'ws') + `/simulations/ws/${Date.now()}`
      } else {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        wsUrl = `${wsProtocol}//${window.location.host}/api/simulations/ws/${Date.now()}`
      }
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      const chartData = []
      setLiveData([]); setProgress(0)

      ws.onopen = () => {
        setWsConnected(true)
        ws.send(JSON.stringify({ experiment_id: expId, sim_type: simType, parameters: {}, iterations: iters }))
      }
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data)
        if (msg.type === 'progress') {
          setProgress(msg.progress)
          setLiveData(prev => [...prev.slice(-80), { iteration: Math.round(msg.progress * iters), value: msg.value }])
        } else if (msg.type === 'complete') {
          setProgress(1); setWsConnected(false); resolve(msg.result)
        } else if (msg.type === 'error') {
          setWsConnected(false); reject(msg.message)
        }
      }
      ws.onerror = () => { setWsConnected(false); reject('WebSocket error') }
      ws.onclose = () => { setWsConnected(false); reject('WebSocket closed unexpectedly') }
    })
  }

  const handleRun = async () => {
    if (!form.experiment_id) { addToast('Please select an experiment', 'error'); return }
    try {
      addToast('Starting simulation…', 'info')
      let result
      try {
        result = await runWithWS(form.experiment_id, form.sim_type, form.iterations)
      } catch {
        result = await runSimulation(form)
      }
      setLastResult(result)
      addToast(`Simulation completed — ${result?.results?.success ? '✅ Success' : '⚠️ Below threshold'}`, result?.results?.success ? 'success' : 'error')
      fetchSimulations()
    } catch (e) { addToast('Simulation failed: ' + e, 'error') }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title"><motion.span animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ display: 'inline-block', marginRight: 12, color: 'var(--violet-light)' }}><Zap size={32} /></motion.span> Simulation Runner</div>
        <p className="page-desc">Execute real-time simulations with live convergence tracking via WebSocket streaming.</p>
      </div>

      {/* Sim Type Selector */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {SIM_TYPES.map(st => (
          <motion.div key={st.id} className="card" style={{ cursor: 'pointer', borderColor: form.sim_type === st.id ? st.color : 'var(--border)', padding: 18 }}
            onClick={() => setForm(f => ({ ...f, sim_type: st.id }))} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{st.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: form.sim_type === st.id ? st.color : 'var(--text-primary)', marginBottom: 4 }}>{st.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{st.desc}</div>
            {form.sim_type === st.id && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 16 }}><CheckCircle2 size={16} color={st.color}/></div>}
          </motion.div>
        ))}
      </div>

      {/* Run Controls */}
      <motion.div className="card" style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card-header"><div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}><Rocket size={20} color="#F43F5E"/> Run Simulation</div>
          {wsConnected && <span className="badge badge-emerald">● WebSocket Live</span>}
        </div>
        <div className="responsive-flex" style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label className="form-label">Select Experiment</label>
            <select className="form-select" value={form.experiment_id} onChange={e => setForm(f => ({ ...f, experiment_id: e.target.value }))}>
              <option value="">-- Choose an experiment --</option>
              {experiments.map(e => <option key={e.id} value={e.id}>{e.name} [{e.methodology}]</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">Iterations</label>
            <input type="number" className="form-input" value={form.iterations} min={100} max={5000}
              onChange={e => setForm(f => ({ ...f, iterations: parseInt(e.target.value) || 500 }))} />
          </div>
          <motion.button className={`btn btn-primary ${simRunning ? 'btn-loading' : ''}`} style={{display: 'flex', alignItems: 'center', gap: 8}} onClick={handleRun} disabled={simRunning} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {simRunning ? <><Loader size={18} className="spin" /> Running…</> : <><Play size={18} /> Run Simulation</>}
          </motion.button>
        </div>

        {/* Live Progress */}
        {(simRunning || progress > 0) && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>{wsConnected ? <><span className="live-dot" style={{width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block'}}></span> Live streaming…</> : 'Processing…'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--violet-light)' }}>{(progress * 100).toFixed(0)}%</span>
            </div>
            <ProgressBar value={progress} />
            {liveData.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>LIVE CONVERGENCE</div>
                <ConvergenceChart data={liveData} height={180} />
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Last Result */}
      {lastResult && (
        <motion.div className="card" style={{ marginBottom: 28, borderColor: lastResult.results?.success ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.3)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-header">
            <div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}>{lastResult.results?.success ? <><CheckCircle2 size={20} color="#10B981" /> Simulation Succeeded</> : <><AlertTriangle size={20} color="#F43F5E" /> Below Threshold</>}</div>
            <span className={`badge badge-${lastResult.results?.success ? 'emerald' : 'rose'}`}>{lastResult.status}</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{lastResult.insights}</p>
          <div className="grid-auto" style={{ gap: 12 }}>
            {Object.entries(lastResult.results || {}).filter(([k,v]) => typeof v !== 'boolean' && !Array.isArray(v)).map(([k, v]) => (
              <div key={k} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--violet-light)' }}>{typeof v === 'number' ? v.toFixed(4) : String(v)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* History */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title" style={{display: 'flex', alignItems: 'center', gap: 8}}><ClipboardList size={20} color="#06B6D4"/> Simulation History</div>
          <button className="btn btn-sm btn-ghost" style={{display: 'flex', alignItems: 'center', gap: 6}} onClick={downloadCSV} disabled={simulations.length === 0}><Download size={16} /> Download CSV</button>
        </div>
        {simLoading ? <LoadingCenter message="Loading simulations…" /> : simulations.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon" style={{color: 'var(--text-muted)'}}><Zap size={32} /></div><div className="empty-state-title">No simulations yet</div></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Type</th><th>Experiment</th><th>Iterations</th><th>Status</th><th>Result</th><th>Date</th></tr></thead>
              <tbody>
                {simulations.map(s => (
                  <tr key={s.id}>
                    <td><span className="tag">{s.sim_type?.replace(/_/g,' ')}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.experiment_id?.slice(0,8)}…</td>
                    <td>{s.iterations?.toLocaleString()}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ color: s.results?.success ? '#10B981' : '#F43F5E', fontWeight: 600 }}>
                      {s.status === 'completed' ? (s.results?.success ? <div style={{display: 'flex', alignItems: 'center', gap: 4}}><CheckCircle2 size={14}/> Pass</div> : <div style={{display: 'flex', alignItems: 'center', gap: 4}}><AlertTriangle size={14}/> Fail</div>) : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.created_at ? new Date(s.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
