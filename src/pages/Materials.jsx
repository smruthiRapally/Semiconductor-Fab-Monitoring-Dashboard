import React, { useState } from 'react'
import PageHero from '../components/PageHero'
const HERO_IMG = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&fit=crop'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  Package, AlertTriangle, TrendingUp, DollarSign,
  Truck, Globe, Radio, RefreshCw, Search, Filter,
} from 'lucide-react'
import { materialsData } from '../data/mockData'

const CATEGORY_COLORS = {
  Substrate: '#2563eb',
  Chemical:  '#06b6d4',
  'Process Gas': '#10b981',
  Metal:     '#8b5cf6',
}

const STATUS_CFG = {
  adequate: { color:'#4ade80', bg:'rgba(74,222,128,0.1)', border:'rgba(74,222,128,0.3)', label:'In Stock' },
  low:      { color:'#fbbf24', bg:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.3)', label:'Low Stock' },
  critical: { color:'#f87171', bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)', label:'Critical' },
}

function formatINR(val) {
  if (val >= 10000000) return `â‚¹${(val/10000000).toFixed(2)}Cr`
  if (val >= 100000)   return `â‚¹${(val/100000).toFixed(1)}L`
  return `â‚¹${val.toLocaleString('en-IN')}`
}

const FabTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-bold" style={{ color:p.fill||'#60a5fa' }}>
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function Materials() {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')

  const categories = ['All', ...new Set(materialsData.map(m => m.category))]
  const filtered = materialsData
    .filter(m => filterCat === 'All' || m.category === filterCat)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.supplier.toLowerCase().includes(search.toLowerCase()))

  const totalCost     = materialsData.reduce((s,m) => s+m.totalCost, 0)
  const criticalCount = materialsData.filter(m => m.status === 'critical').length
  const lowCount      = materialsData.filter(m => m.status === 'low').length
  const adequateCount = materialsData.filter(m => m.status === 'adequate').length

  const catTotals = Object.entries(
    materialsData.reduce((acc, m) => {
      acc[m.category] = (acc[m.category]||0) + m.totalCost
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name]||'#475569' }))

  const topMaterials = [...materialsData].sort((a,b) => b.totalCost - a.totalCost).slice(0,5)

  return (
    <div className="space-y-5">
      <PageHero src={HERO_IMG} badge="Inventory & Cost · Live" title="Materials & Cost Management" sub="Raw material inventory, cost tracking, supplier details and reorder status." />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            <span className="gradient-text-cyan">Materials</span> &amp; Cost Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Radio size={10} className="text-green-400 live-dot"/>
            Raw material inventory, costs, and supplier tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="fab-badge badge-red"><AlertTriangle size={9}/>{criticalCount} CRITICAL</span>
          )}
          {lowCount > 0 && (
            <span className="fab-badge badge-amber">{lowCount} LOW STOCK</span>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l:'Total Material Cost', v:formatINR(totalCost), c:'#2563eb', glow:'rgba(37,99,235,0.3)', icon:DollarSign },
          { l:'Inventory Items', v:String(materialsData.length), c:'#06b6d4', glow:'rgba(6,182,212,0.3)', icon:Package },
          { l:'Critical Stock', v:String(criticalCount), c:'#f87171', glow:'rgba(248,113,113,0.3)', icon:AlertTriangle },
          { l:'Adequate Stock', v:String(adequateCount), c:'#4ade80', glow:'rgba(74,222,128,0.3)', icon:RefreshCw },
        ].map((s,i) => {
          const Icon = s.icon
          return (
            <div key={s.l} className="glass rounded-2xl p-4 relative overflow-hidden stat-card-fab anim-fade-up"
              style={{ animationDelay:`${i*70}ms`, border:`1px solid ${s.c}20` }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:`linear-gradient(90deg,transparent,${s.c},transparent)` }}/>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background:`${s.c}20`, border:`1px solid ${s.c}40`, boxShadow:`0 0 16px ${s.glow}` }}>
                  <Icon size={16} style={{ color:s.c }}/>
                </div>
              </div>
              <p className="text-xl font-black text-white">{s.v}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{s.l}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cost by category pie */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up">
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#8b5cf6,transparent)' }}/>
          <h2 className="text-sm font-bold text-white mb-1">Cost by Category</h2>
          <p className="text-[10px] text-slate-500 mb-3">Total spend distribution</p>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={catTotals} cx="50%" cy="50%" outerRadius={65} innerRadius={38}
                  dataKey="value" strokeWidth={0} paddingAngle={3}>
                  {catTotals.map((d,i) => (
                    <Cell key={i} fill={d.color} style={{ filter:`drop-shadow(0 0 6px ${d.color}60)` }}/>
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active||!payload?.length) return null
                  const d = payload[0]
                  return <div className="glass rounded px-2 py-1.5" style={{ border:`1px solid ${d.payload.color}40` }}>
                    <p className="text-[10px] font-bold" style={{ color:d.payload.color }}>{d.name}</p>
                    <p className="text-[10px] text-white">{formatINR(d.value)}</p>
                  </div>
                }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {catTotals.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background:d.color }}/>
                  <span className="text-[10px] text-slate-400">{d.name}</span>
                </div>
                <span className="text-[10px] font-bold" style={{ color:d.color }}>{formatINR(d.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top materials by cost */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'100ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#06b6d4,transparent)' }}/>
          <h2 className="text-sm font-bold text-white mb-1">Top 5 Materials by Cost</h2>
          <p className="text-[10px] text-slate-500 mb-3">Highest spend items</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topMaterials.map(m => ({ name:m.name.split(' ').slice(0,2).join(' '), cost:m.totalCost, fill:CATEGORY_COLORS[m.category]||'#2563eb' }))}
              layout="vertical" margin={{ top:0, right:10, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false} tickFormatter={v=>formatINR(v)}/>
              <YAxis type="category" dataKey="name" tick={{ fontSize:9, fill:'#64748b' }} axisLine={false} tickLine={false} width={90}/>
              <Tooltip content={<FabTooltip/>}/>
              <Bar dataKey="cost" name="Cost" radius={[0,4,4,0]} maxBarSize={18}>
                {topMaterials.map((m,i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[m.category]||'#2563eb'} style={{ filter:`drop-shadow(0 0 4px ${CATEGORY_COLORS[m.category]||'#2563eb'}60)` }}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass rounded-2xl overflow-hidden anim-fade-up" style={{ animationDelay:'200ms' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom:'1px solid rgba(59,130,246,0.1)' }}>
          <div>
            <h2 className="text-sm font-bold text-white">Material Inventory</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{filtered.length} items Â· Complete cost &amp; supplier view</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(59,130,246,0.15)' }}>
              <Search size={11} className="text-slate-500"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search material or supplierâ€¦"
                className="bg-transparent text-[10px] text-slate-300 outline-none w-36 placeholder-slate-600"/>
            </div>
            {/* Category filter */}
            <div className="flex flex-wrap gap-1">
              {categories.map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  className="text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all"
                  style={{
                    background: filterCat===c ? 'rgba(37,99,235,0.25)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${filterCat===c ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.1)'}`,
                    color: filterCat===c ? '#93c5fd' : '#475569',
                  }}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-blue-950/30">
          {filtered.map((m) => {
            const st = STATUS_CFG[m.status]
            const catColor = CATEGORY_COLORS[m.category]||'#475569'
            return (
              <div key={m.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-white">{m.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{m.category}</p>
                  </div>
                  <span className="fab-badge flex-shrink-0" style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>{st.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-[9px] text-slate-600">Quantity</p><p className="text-[11px] font-bold text-slate-200">{m.qty.toLocaleString('en-IN')} {m.unit}</p></div>
                  <div><p className="text-[9px] text-slate-600">Cost/Unit</p><p className="text-[11px] font-bold text-slate-200">{formatINR(m.costPerUnit)}</p></div>
                  <div><p className="text-[9px] text-slate-600">Total Cost</p><p className="text-[11px] font-bold text-green-300">{formatINR(m.totalCost)}</p></div>
                  <div><p className="text-[9px] text-slate-600">Lead Time</p><p className="text-[11px] font-bold text-slate-200">{m.leadTime}</p></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-600">Stock Level</span>
                    <span className="text-[9px] font-bold" style={{ color:st.color }}>{m.inventoryPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
                    <div className="h-full rounded-full" style={{ width:`${m.inventoryPct}%`, background:st.color, boxShadow:`0 0 4px ${st.color}60` }}/>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={10} className="text-slate-500"/>
                  <span className="text-[10px] text-slate-400">{m.supplier}</span>
                  <span className="text-[9px] text-slate-600">Â· {m.supplierCountry}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full fab-table">
            <thead>
              <tr>
                <th>#</th><th>Material</th><th>Category</th><th>Qty</th>
                <th>Cost/Unit</th><th>Total Cost</th><th>Stock Level</th>
                <th>Supplier</th><th>Lead Time</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const st = STATUS_CFG[m.status]
                const catColor = CATEGORY_COLORS[m.category]||'#475569'
                return (
                  <tr key={m.id}>
                    <td className="text-slate-600 font-mono text-[10px]">{String(i+1).padStart(2,'0')}</td>
                    <td>
                      <p className="font-semibold text-slate-200 text-[11px]">{m.name}</p>
                    </td>
                    <td>
                      <span className="fab-badge text-[9px]"
                        style={{ background:`${catColor}15`, color:catColor, border:`1px solid ${catColor}30` }}>
                        {m.category}
                      </span>
                    </td>
                    <td className="text-slate-300 font-semibold">{m.qty.toLocaleString('en-IN')} <span className="text-slate-600 text-[10px]">{m.unit}</span></td>
                    <td className="text-slate-300">{formatINR(m.costPerUnit)}</td>
                    <td className="font-bold text-green-300">{formatINR(m.totalCost)}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
                          <div className="h-full rounded-full" style={{ width:`${m.inventoryPct}%`, background:st.color, boxShadow:`0 0 4px ${st.color}60` }}/>
                        </div>
                        <span className="text-[9px] font-bold w-7" style={{ color:st.color }}>{m.inventoryPct}%</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-[10px] text-slate-300">{m.supplier}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Globe size={9} className="text-slate-600"/>
                          <span className="text-[9px] text-slate-600">{m.supplierCountry}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Truck size={10} className="text-slate-500"/>
                        <span className="text-[10px] text-slate-400">{m.leadTime}</span>
                      </div>
                    </td>
                    <td>
                      <span className="fab-badge" style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
          style={{ borderTop:'1px solid rgba(59,130,246,0.08)' }}>
          <span className="text-[10px] text-slate-600">{filtered.length} of {materialsData.length} items</span>
          <span className="text-[10px] text-slate-500">Total inventory value: <span className="font-bold text-green-300">{formatINR(totalCost)}</span></span>
        </div>
      </div>
    </div>
  )
}


