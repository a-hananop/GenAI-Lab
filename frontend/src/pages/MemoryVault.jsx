import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import { LoadingCenter } from '../components/UI/index'
import ForceGraph2D from 'react-force-graph-2d'

export default function MemoryVault() {
  const { memories, memLoading, memSearchResults, knowledgeGraph, fetchMemories, searchMemory, fetchGraph, addToast } = useStore()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [searching, setSearching] = useState(false)

  useEffect(() => { fetchMemories(); fetchGraph() }, [])

  const handleSearch = async () => {
    if (!query.trim()) { fetchMemories(); return }
    setSearching(true)
    try { await searchMemory(query) }
    catch (e) { addToast('Search failed: ' + e, 'error') }
    finally { setSearching(false) }
  }

  const displayMemories = query && memSearchResults ? memSearchResults : memories
  const filtered = tab === 'all' ? displayMemories : displayMemories.filter(m => m.memory_type === tab)
  const types = ['all', ...new Set(memories.map(m => m.memory_type))]
  const graph = knowledgeGraph
  const outcomeColor = { success: '#10B981', failure: '#F43F5E', neutral: '#94a3b8' }
  const typeIcon = { experiment: '🔬', hypothesis: '🧬', analysis: '📊', loop: '🔄' }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title"><span className="page-title-icon">🧠</span> Memory Vault</div>
        <p className="page-desc">Long-term research memory with semantic search and knowledge graph.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Memories', value: memories.length, color: '#8B5CF6', icon: '🧠' },
          { label: 'Successes', value: memories.filter(m => m.outcome === 'success').length, color: '#10B981', icon: '✅' },
          { label: 'Failures', value: memories.filter(m => m.outcome === 'failure').length, color: '#F43F5E', icon: '⚠️' },
          { label: 'Graph Nodes', value: graph?.total_nodes || 0, color: '#06B6D4', icon: '🕸️' },
        ].map((s, i) => (
          <motion.div key={i} style={{ padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div className="card" style={{ marginBottom: 24 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input className="form-input" style={{ flex: 1 }} placeholder="🔍 Semantic search memories…"
            value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <button className={`btn btn-primary ${searching ? 'btn-loading' : ''}`} onClick={handleSearch} disabled={searching}>
            {searching ? '⏳' : '🔍 Search'}
          </button>
          {query && <button className="btn btn-ghost" onClick={() => { setQuery(''); fetchMemories() }}>✕ Clear</button>}
        </div>
      </motion.div>

      {graph && graph.total_nodes > 0 && (
        <motion.div className="card" style={{ marginBottom: 24, borderColor: 'rgba(6,182,212,0.3)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card-header">
            <div className="card-title">🕸️ Knowledge Graph</div>
            <span className="badge badge-cyan">{graph.total_nodes} nodes · {graph.total_edges} edges</span>
          </div>
          <div style={{ height: 400, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
            <ForceGraph2D
              graphData={{ nodes: graph.nodes.map(n => ({...n, name: n.label})), links: graph.edges }}
              height={400}
              nodeColor={n => outcomeColor[n.outcome] || '#8B5CF6'}
              nodeLabel="name"
              nodeRelSize={6}
              linkColor={() => 'rgba(255,255,255,0.1)'}
              backgroundColor="transparent"
            />
          </div>
        </motion.div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {types.map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>
            {t === 'all' ? `All (${memories.length})` : `${t} (${memories.filter(m => m.memory_type === t).length})`}
          </button>
        ))}
      </div>

      {memLoading ? <LoadingCenter message="Loading memory vault…" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">🧠</div><div className="empty-state-title">Memory vault is empty</div><div className="empty-state-desc">Run research loops to populate long-term memory</div></div></div>
          ) : filtered.map((mem, i) => (
            <motion.div key={mem.id} className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${outcomeColor[mem.outcome] || '#94a3b8'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {typeIcon[mem.memory_type] || '📝'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span className={`badge badge-${mem.outcome === 'success' ? 'emerald' : mem.outcome === 'failure' ? 'rose' : 'gray'}`}>{mem.outcome}</span>
                    <span className="badge badge-violet">{mem.memory_type}</span>
                    {mem.relevance_score > 0 && <span className="badge badge-cyan">relevance: {(mem.relevance_score * 100).toFixed(0)}%</span>}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{mem.created_at ? new Date(mem.created_at).toLocaleString() : ''}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{mem.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>{mem.content?.slice(0, 200)}{mem.content?.length > 200 ? '…' : ''}</p>
                  <div className="tags">{(mem.embedding_keywords || []).slice(0, 8).map(kw => <span key={kw} className="tag">{kw}</span>)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
