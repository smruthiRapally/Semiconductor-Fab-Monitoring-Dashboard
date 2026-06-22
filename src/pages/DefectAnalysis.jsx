import React, { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts'
import {
  AlertTriangle, TrendingUp, TrendingDown, Minus,
  ShieldCheck, Radio, Zap, Microscope, Activity,
  Layers, Target, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { defectDistribution, defectTable, defectSummaryCards } from '../data/mockData'

const COLORS = { High:'#f87171', Medium:'#fbbf24', Low:'#4ade80' }
const TREND_ICON = {
  up:     <TrendingUp  size={12} className="text-red-400"/>,
  down:   <TrendingDown size={12} className="text-green-400"/>,
  stable: <Minus size={12} className="text-slate-500"/>,
}

/* ── Process-stage defect distribution (replaces Defect Profile) ── */
const stageDefects = [
  { stage:'Lithography', particle:52, pattern:38, alignment:18, contamination:12 },
  { stage:'Etching',     particle:28, pattern:44, alignment:14, contamination:8  },
  { stage:'Deposition',  particle:18, pattern:8,  alignment:16, contamination:9  },
  { stage:'Metallization',particle:14,pattern:6,  alignment:5,  contamination:4  },
  { stage:'Oxidation',   particle:8,  pattern:2,  alignment:3,  contamination:1  },
  { stage:'CMP',         particle:8,  pattern:0,  alignment:0,  contamination:0  },
]

/* ── Root Cause Analysis (replaces 5-Day Trend) ── */
const rootCauses = [
  { cause:'Photoresist Outgassing', defects:62, process:'Lithography', risk:'High',  cost:186000, icon:'🧪', mitigation:'Increase bake temp to 130°C, check resist shelf life' },
  { cause:'Plasma Non-Uniformity',  defects:44, process:'Etching',     risk:'High',  cost:132000, icon:'⚡', mitigation:'Recalibrate RF power distribution, clean chamber walls' },
  { cause:'Particle Contamination', defects:38, process:'Clean Room',  risk:'High',  cost:114000, icon:'🔬', mitigation:'Upgrade HEPA filters, enforce stricter gowning protocol' },
  { cause:'Wafer Chuck Vibration',  defects:24, process:'Lithography', risk:'Medium',cost:72000,  icon:'📡', mitigation:'Anti-vibration mounts, predictive maintenance schedule' },
  { cause:'CVD Precursor Impurity', defects:18, process:'Deposition',  risk:'Medium',cost:54000,  icon:'⚗️', mitigation:'Replace precursor batch, increase purity spec to 99.999%' },
  { cause:'Gate Oxide Pinhole',     defects:14, process:'Oxidation',   risk:'Medium',cost:42000,  icon:'🔷', mitigation:'Controlled O₂ partial pressure, post-anneal N₂ treatment' },
  { cause:'Metal Hillock Growth',   defects:10, process:'Metallization',risk:'Low',  cost:30000,  icon:'🔩', mitigation:'Lower deposition temp, add Ti adhesion layer' },
  { cause:'CMP Slurry Agglomeration',defects:8, process:'CMP',        risk:'Low',   cost:24000,  icon:'⚙️', mitigation:'Increase slurry refresh rate, optimize down-force' },
]

/* ── Defect density by wafer zone ── */
const zoneData = [
  { zone:'Center',      density:0.012, good:94, defect:6  },
  { zone:'Mid-radius',  density:0.019, good:91, defect:9  },
  { zone:'Edge (5mm)',  density:0.048, good:78, defect:22 },
  { zone:'Notch Area',  density:0.031, good:84, defect:16 },
]

/* ── Escape rate by inspection step ── */
const inspectionEscape = [
  { step:'After Litho', captured:88, escaped:12 },
  { step:'After Etch',  captured:79, escaped:21 },
  { step:'After CVD',   captured:92, escaped:8  },
  { step:'After CMP',   captured:95, escaped:5  },
  { step:'Final Test',  captured:98, escaped:2  },
]

const RISK_CFG = {
  High:   { color:'#f87171', bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)' },
  Medium: { color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.3)'  },
  Low:    { color:'#4ade80', bg:'rgba(74,222,128,0.1)',   border:'rgba(74,222,128,0.3)'  },
}

function formatINR(val) {
  if (val >= 100000) return `₹${(val/100000).toFixed(1)}L`
  return `₹${val.toLocaleString('en-IN')}`
}

const FabTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-bold" style={{ color:p.color||'#60a5fa' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function DefectRing({ data }) {
  return (
    <div className="relative flex items-center justify-center" style={{ height:180 }}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={78}
            paddingAngle={4} dataKey="value" strokeWidth={0} startAngle={90} endAngle={450}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} style={{ filter:`drop-shadow(0 0 8px ${d.color}60)`, cursor:'pointer' }}/>
            ))}
          </Pie>
          <Tooltip content={({ active, payload }) => {
            if (!active||!payload?.length) return null
            const d = payload[0]
            return (
              <div className="glass rounded-lg px-3 py-2" style={{ border:`1px solid ${d.payload.color}40` }}>
                <p className="text-xs font-bold" style={{ color:d.payload.color }}>{d.name}</p>
                <p className="text-sm font-black text-white">{d.value}%</p>
              </div>
            )
          }}/>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-2xl font-black text-white">356</p>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest">Total</p>
      </div>
    </div>
  )
}

export default function DefectAnalysis() {
  const [activeRCA, setActiveRCA] = useState(null)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            <span className="gradient-text-cyan">Defect</span> Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Radio size={10} className="text-green-400 live-dot"/>
            Defect classification · Root cause · Process stage insights
          </p>
        </div>
        <div className="flex gap-2">
          <div className="fab-badge badge-red"><AlertTriangle size={9}/>38 CRITICAL</div>
          <div className="fab-badge badge-amber"><Zap size={9}/>ROOT CAUSE ACTIVE</div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {defectSummaryCards.map((c, i) => {
          const isPos = c.changeType === 'positive'
          const accent = i===0?'#f87171':i===1?'#fbbf24':i===2?'#f87171':'#4ade80'
          return (
            <div key={c.label} className="glass rounded-2xl p-4 relative overflow-hidden stat-card-fab anim-fade-up"
              style={{ animationDelay:`${i*70}ms`, border:`1px solid ${accent}20` }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:`linear-gradient(90deg,transparent,${accent},transparent)` }}/>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">{c.label}</p>
              <p className="text-2xl font-black" style={{ color:accent }}>
                {c.value}
                {c.unit && <span className="text-xs text-slate-500 ml-1 font-normal">{c.unit}</span>}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {isPos?<TrendingDown size={11} className="text-green-400"/>:<TrendingUp size={11} className="text-red-400"/>}
                <span className={`text-[10px] font-bold ${isPos?'text-green-400':'text-red-400'}`}>{c.change}</span>
                <span className="text-[9px] text-slate-600">vs last period</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Row 1: Distribution + Stage Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie ring */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'150ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#ef4444,transparent)' }}/>
          <h2 className="text-sm font-bold text-white mb-1">Defect Distribution</h2>
          <p className="text-[10px] text-slate-500 mb-3">Current period breakdown</p>
          <DefectRing data={defectDistribution}/>
          <div className="space-y-2 mt-3">
            {defectDistribution.map(d => (
              <div key={d.name}>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background:d.color }}/>
                    <span className="text-[10px] text-slate-400">{d.name}</span>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color:d.color }}>{d.value}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(30,41,59,0.8)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width:`${d.value}%`, background:d.color, boxShadow:`0 0 6px ${d.color}` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defects by process stage — stacked bar (replaces Defect Profile) */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'200ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#06b6d4,transparent)' }}/>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Microscope size={14} className="text-cyan-400"/>Defects by Process Stage
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Where defects originate across the fab line</p>
            </div>
            <span className="fab-badge badge-cyan">STAGE ANALYSIS</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageDefects} margin={{ top:5, right:5, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false}/>
              <XAxis dataKey="stage" tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<FabTooltip/>}/>
              <Bar dataKey="particle"      name="Particle"      stackId="a" fill="#ef4444"  maxBarSize={32}/>
              <Bar dataKey="pattern"       name="Pattern"       stackId="a" fill="#f59e0b"  maxBarSize={32}/>
              <Bar dataKey="alignment"     name="Alignment"     stackId="a" fill="#3b82f6"  maxBarSize={32}/>
              <Bar dataKey="contamination" name="Contamination" stackId="a" fill="#8b5cf6" radius={[4,4,0,0]} maxBarSize={32}/>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2">
            {[['Particle','#ef4444'],['Pattern','#f59e0b'],['Alignment','#3b82f6'],['Contamination','#8b5cf6']].map(([l,c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background:c }}/>
                <span className="text-[9px] text-slate-500">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Wafer Zone Defect Map + Inspection Escape Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Wafer zone density */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'250ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#8b5cf6,transparent)' }}/>
          <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Layers size={14} className="text-purple-400"/>Wafer Zone Defect Density
          </h2>
          <p className="text-[10px] text-slate-500 mb-4">Defect distribution across wafer regions</p>
          <div className="space-y-3">
            {zoneData.map(z => (
              <div key={z.zone} className="rounded-xl p-3" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.08)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-200">{z.zone}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500">Density:</span>
                    <span className="text-[10px] font-black" style={{ color: z.density>0.04?'#f87171':z.density>0.02?'#fbbf24':'#4ade80' }}>
                      {z.density}/cm²
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 h-2.5 rounded-full overflow-hidden">
                  <div className="rounded-l-full" style={{ width:`${z.good}%`, background:'linear-gradient(90deg,#1d4ed8,#06b6d4)', boxShadow:'0 0 4px rgba(6,182,212,0.4)' }}/>
                  <div className="rounded-r-full" style={{ width:`${z.defect}%`, background:'linear-gradient(90deg,#ef4444,#f87171)', boxShadow:'0 0 4px rgba(239,68,68,0.4)' }}/>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-cyan-400">{z.good}% good</span>
                  <span className="text-[9px] text-red-400">{z.defect}% defect</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inspection escape rate */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'280ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#10b981,transparent)' }}/>
          <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Target size={14} className="text-green-400"/>Inspection Capture &amp; Escape Rate
          </h2>
          <p className="text-[10px] text-slate-500 mb-4">Defect detection effectiveness by inspection step</p>
          <div className="space-y-3">
            {inspectionEscape.map(s => (
              <div key={s.step}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-300 font-medium">{s.step}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-green-400 font-bold">{s.captured}% captured</span>
                    <span className="text-[9px] text-red-400 font-bold">{s.escaped}% escaped</span>
                  </div>
                </div>
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                  <div style={{ width:`${s.captured}%`, background:'linear-gradient(90deg,#10b981,#4ade80)' }}/>
                  <div style={{ width:`${s.escaped}%`, background:'rgba(239,68,68,0.5)' }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop:'1px solid rgba(59,130,246,0.1)' }}>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-400"/>
              <span className="text-[10px] text-slate-400">Overall Capture Rate: <span className="font-bold text-green-300">98.4%</span></span>
            </div>
            <span className="fab-badge badge-green">EXCELLENT</span>
          </div>
        </div>
      </div>

      {/* Root Cause Analysis (replaces 5-Day Trend) */}
      <div className="glass rounded-2xl overflow-hidden anim-fade-up" style={{ animationDelay:'300ms' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom:'1px solid rgba(59,130,246,0.1)' }}>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity size={14} className="text-amber-400"/>Root Cause Analysis (RCA)
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{rootCauses.length} identified root causes · Click row for mitigation strategy</p>
          </div>
          <span className="fab-badge badge-amber"><AlertTriangle size={9}/>{rootCauses.filter(r=>r.risk==='High').length} HIGH RISK</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full fab-table">
            <thead>
              <tr><th>Root Cause</th><th>Process Step</th><th>Defects</th><th>Risk</th><th>Est. Cost/Month</th><th>Mitigation</th></tr>
            </thead>
            <tbody>
              {rootCauses.map((r, i) => {
                const rc = RISK_CFG[r.risk]
                return (
                  <tr key={i} onClick={() => setActiveRCA(activeRCA===i?null:i)}
                    className="cursor-pointer">
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.icon}</span>
                        <span className="font-semibold text-slate-200 text-[11px]">{r.cause}</span>
                      </div>
                    </td>
                    <td className="text-slate-400 text-[10px]">{r.process}</td>
                    <td className="font-bold text-white">{r.defects}</td>
                    <td>
                      <span className="fab-badge" style={{ background:rc.bg, color:rc.color, border:`1px solid ${rc.border}` }}>
                        {r.risk}
                      </span>
                    </td>
                    <td className="font-bold text-red-300">{formatINR(r.cost)}</td>
                    <td>
                      {activeRCA===i ? (
                        <p className="text-[10px] text-cyan-300 max-w-xs">{r.mitigation}</p>
                      ) : (
                        <span className="text-[9px] text-slate-600 italic">Click to expand →</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Defect log table */}
      <div className="glass rounded-2xl overflow-hidden anim-fade-up" style={{ animationDelay:'350ms' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom:'1px solid rgba(59,130,246,0.1)' }}>
          <div>
            <h2 className="text-sm font-bold text-white">Defect Log</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{defectTable.length} defect types tracked this period</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-green-400"/>
            <span className="text-[10px] text-slate-400">Inspection: <span className="text-green-400 font-bold">98.4%</span></span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full fab-table">
            <thead>
              <tr><th>#</th><th>Defect Type</th><th>Count</th><th>Severity</th><th>Location</th><th>Trend</th></tr>
            </thead>
            <tbody>
              {defectTable.map((r, i) => (
                <tr key={r.id}>
                  <td className="text-slate-600 font-mono text-[10px]">{String(i+1).padStart(2,'0')}</td>
                  <td className="font-semibold text-slate-200">{r.type}</td>
                  <td className="font-bold text-white">{r.count}</td>
                  <td>
                    <span className="fab-badge" style={{ background:COLORS[r.severity]+'20', color:COLORS[r.severity], border:`1px solid ${COLORS[r.severity]}40` }}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="text-slate-400">{r.location}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {TREND_ICON[r.trend]}
                      <span className="text-[10px] text-slate-500 capitalize">{r.trend}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
