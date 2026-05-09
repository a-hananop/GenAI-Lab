import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

const tooltipStyle = {
  contentStyle: { background: '#0f1629', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, color: '#f1f5f9', fontSize: 13 },
  labelStyle: { color: '#94a3b8' },
}

// ===== CONVERGENCE CHART =====
export function ConvergenceChart({ data = [], height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="iteration" stroke="#475569" tick={{ fontSize: 11 }} />
        <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fill="url(#convGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ===== CONFIDENCE EVOLUTION CHART =====
export function ConfidenceChart({ data = [], height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="label" stroke="#475569" tick={{ fontSize: 11 }} />
        <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={[0, 100]} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey="confidence" stroke="#06B6D4" strokeWidth={2} fill="url(#confGrad)" dot={{ fill: '#06B6D4', r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ===== DOMAIN DISTRIBUTION BAR CHART =====
export function DomainChart({ data = [], height = 220 }) {
  const colors = ['#8B5CF6','#06B6D4','#10B981','#F59E0B','#F43F5E','#3B82F6','#EC4899','#14B8A6']
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="domain" stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} angle={-30} textAnchor="end" />
        <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <rect key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ===== A/B TEST COMPARISON CHART =====
export function ABTestChart({ controlMean, treatmentMean, height = 200 }) {
  const data = [
    { name: 'Control', value: controlMean * 100, fill: '#475569' },
    { name: 'Treatment', value: treatmentMean * 100, fill: '#8B5CF6' },
  ]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
        <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v.toFixed(2)}%`, 'Score']} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => <rect key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ===== MULTI LINE CHART =====
export function MultiLineChart({ data = [], lines = [], height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} />
        <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        {lines.map(l => (
          <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} dot={false} name={l.name} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
