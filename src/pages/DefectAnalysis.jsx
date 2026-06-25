import React, { useState } from 'react'
import PageHero from '../components/PageHero'
const HERO_IMG = 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&q=80&fit=crop'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  AlertTriangle, TrendingUp, TrendingDown, Minus,
  ShieldCheck, Radio, Zap, Microscope, Activity,
  Layers, Target,
} from 'lucide-react'
import { defectDistribution, defectTable, defectSummaryCards } from '../data/mockData'

const SEV_COLORS = { High:'#dc2626', Medium:'#d97706', Low:'#16a34a' }
const SEV_BG     = { High:'#fef2f2', Medium:'#fffbeb', Low:'#f0fdf4' }
const SEV_BORDER = { High:'#fecaca', Medium:'#fde68a', Low:'#bbf7d0' }
const TREND_ICON = {
  up:     <TrendingUp  size={12} className="text-red-500"/>,
  down:   <TrendingDown size={12} className="text-green-600"/>,
  stable: <Minus size={12} className="text-slate-400"/>,
}

const stageDefects = [
  { stage:'Lithography', particle:52, pattern:38, alignment:18, contamination:12 },
  { stage:'Etching',     particle:28, pattern:44, alignment:14, contamination:8  },
  { stage:'Deposition',  particle:18, pattern:8,  alignment:16, contamination:9  },
  { stage:'Metallization',particle:14,pattern:6,  alignment:5,  contamination:4  },
  { stage:'Oxidation',   particle:8,  pattern:2,  alignment:3,  contamination:1  },
  { stage:'CMP',         particle:8,  pattern:0,  alignment:0,  contamination:0  },
]

const rootCauses = [
  { cause:'Photoresist Outgassing', defects:62, process:'Lithography',  risk:'High',   cost:186000, icon:'ðŸ§ª', mitigation:'Increase bake temp to 130Â°C, check resist shelf life' },
  { cause:'Plasma Non-Uniformity',  defects:44, process:'Etching',      risk:'High',   cost:132000, icon:'âš¡', mitigation:'Recalibrate RF power distribution, clean chamber walls' },
  { cause:'Particle Contamination', defects:38, process:'Clean Room',   risk:'High',   cost:114000, icon:'ðŸ”¬', mitigation:'Upgrade HEPA filters, enforce stricter gowning protocol' },
  { cause:'Wafer Chuck Vibration',  defects:24, process:'Lithography',  risk:'Medium', cost:72000,  icon:'ðŸ“¡', mitigation:'Anti-vibration mounts, predictive maintenance schedule' },
  { cause:'CVD Precursor Impurity', defects:18, process:'Deposition',   risk:'Medium', cost:54000,  icon:'âš—ï¸', mitigation:'Replace precursor batch, increase purity spec to 99.999%' },
  { cause:'Gate Oxide Pinhole',     defects:14, process:'Oxidation',    risk:'Medium', cost:42000,  icon:'ðŸ”·', mitigation:'Controlled Oâ‚‚ partial pressure, post-anneal Nâ‚‚ treatment' },
  { cause:'Metal Hillock Growth',   defects:10, process:'Metallization',risk:'Low',    cost:30000,  icon:'ðŸ”©', mitigation:'Lower deposition temp, add Ti adhesion layer' },
  { cause:'CMP Slurry Agglomeration',defects:8, process:'CMP',         risk:'Low',    cost:24000,  icon:'âš™ï¸', mitigation:'Increase slurry refresh rate, optimize down-force' },
]

const zoneData = [
  { zone:'Center',    density:0.012, good:94, defect:6  },
  { zone:'Mid-radius',density:0.019, good:91, defect:9  },
  { zone:'Edge (5mm)',density:0.048, good:78, defect:22 },
  { zone:'Notch Area',density:0.031, good:84, defect:16 },
]

const inspectionEscape = [
  { step:'After Litho', captured:88, escaped:12 },
  { step:'After Etch',  captured:79, escaped:21 },
  { step:'After CVD',   captured:92, escaped:8  },
  { step:'After CMP',   captured:95, escaped:5  },
  { step:'Final Test',  captured:98, escaped:2  },
]

const RISK_CFG = {
  High:   { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
  Medium: { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
  Low:    { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
}

function fmtINR(v) {
  if (v >= 100000) return `â‚¹${(v/100000).toFixed(1)}L`
  return `â‚¹${v.toLocaleString('en-IN')}`
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2">
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-bold" style={{ color:p.color||'#2563eb' }}>
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
            paddingAngle={4} dataKey="value" strokeWidth={2} stroke="#fff" startAngle={90} endAngle={450}>
            {data.map((d, i) => <Cell key={i} fill={d.color} style={{ cursor:'pointer' }}/>)}
          </Pie>
          <Tooltip content={({ active, payload }) => {
            if (!active||!payload?.length) return null
            const d = payload[0]
            return (
              <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2">
                <p className="text-xs font-bold" style={{ color:d.payload.color }}>{d.name}</p>
                <p className="text-sm font-bold text-slate-800">{d.value}%</p>
              </div>
            )
          }}/>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-2xl font-bold text-slate-800">356</p>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest">Total</p>
      </div>
    </div>
  )
}

export default function DefectAnalysis() {
  const [activeRCA, setActiveRCA] = useState(null)

  return (
    <div className="space-y-5">
      <PageHero src={HERO_IMG} badge="Defect Intelligence · RCA" title="Defect Analysis" sub="Defect classification, root cause analysis, and process stage insights." />

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-red-500"/>
            <p className="section-label text-red-600">Defect Intelligence</p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
            Defect Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 live-dot inline-block"/>
            Defect classification Â· Root cause Â· Process stage insights
          </p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-red"><AlertTriangle size={10}/>38 Critical</span>
          <span className="badge badge-amber"><Zap size={10}/>RCA Active</span>
        </div>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {defectSummaryCards.map((c, i) => {
          const isPos = c.changeType === 'positive'
          const colors = [['#dc2626','#fef2f2'],['#d97706','#fffbeb'],['#dc2626','#fef2f2'],['#16a34a','#f0fdf4']]
          const [ac, bg] = colors[i]
          return (
            <div key={c.label} className="stat-card card-lift anim-fade-up"
              style={{ animationDelay:`${i*70}ms`, borderTop:`3px solid ${ac}` }}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">{c.label}</p>
              <p className="text-2xl font-bold" style={{ color:ac }}>
                {c.value}
                {c.unit && <span className="text-xs text-slate-400 ml-1 font-normal">{c.unit}</span>}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {isPos
                  ? <TrendingDown size={11} className="text-green-600"/>
                  : <TrendingUp size={11} className="text-red-500"/>}
                <span className={`text-[10px] font-semibold ${isPos?'text-green-700':'text-red-600'}`}>{c.change}</span>
                <span className="text-[9px] text-slate-400 ml-1">vs last period</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Row 1: Distribution + Stage Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut */}
        <div className="card p-5 anim-fade-up" style={{ animationDelay:'150ms', borderTop:'3px solid #dc2626' }}>
          <h2 className="text-sm font-semibold text-slate-800 mb-0.5">Defect Distribution</h2>
          <p className="text-[10px] text-slate-500 mb-3">Current period breakdown</p>
          <DefectRing data={defectDistribution}/>
          <div className="space-y-2 mt-3">
            {defectDistribution.map(d => (
              <div key={d.name}>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background:d.color }}/>
                    <span className="text-[10px] text-slate-600 font-medium">{d.name}</span>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color:d.color }}>{d.value}%</span>
                </div>
                <div className="progress-track h-1.5">
                  <div className="progress-fill" style={{ width:`${d.value}%`, background:d.color }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked bar by stage */}
        <div className="lg:col-span-2 card p-5 anim-fade-up" style={{ animationDelay:'200ms', borderTop:'3px solid #2563eb' }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Microscope size={14} className="text-blue-600"/>Defects by Process Stage
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Where defects originate across the fab line</p>
            </div>
            <span className="badge badge-blue">Stage Analysis</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageDefects} margin={{ top:5, right:5, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="stage" tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="particle"      name="Particle"      stackId="a" fill="#ef4444" maxBarSize={32}/>
              <Bar dataKey="pattern"       name="Pattern"       stackId="a" fill="#f59e0b" maxBarSize={32}/>
              <Bar dataKey="alignment"     name="Alignment"     stackId="a" fill="#3b82f6" maxBarSize={32}/>
              <Bar dataKey="contamination" name="Contamination" stackId="a" fill="#8b5cf6" radius={[4,4,0,0]} maxBarSize={32}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {[['Particle','#ef4444'],['Pattern','#f59e0b'],['Alignment','#3b82f6'],['Contamination','#8b5cf6']].map(([l,c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background:c }}/>
                <span className="text-[9px] text-slate-500 font-medium">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Wafer Zone + Inspection Escape */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Wafer zone density */}
        <div className="card p-5 anim-fade-up" style={{ animationDelay:'250ms', borderTop:'3px solid #7c3aed' }}>
          <h2 className="text-sm font-semibold text-slate-800 mb-0.5 flex items-center gap-2">
            <Layers size={14} className="text-purple-600"/>Wafer Zone Defect Density
          </h2>
          <p className="text-[10px] text-slate-500 mb-4">Defect distribution across wafer regions</p>
          <div className="space-y-3">
            {zoneData.map(z => (
              <div key={z.zone} className="rounded-xl p-3 bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-700">{z.zone}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-400">Density:</span>
                    <span className="text-[10px] font-bold" style={{ color:z.density>0.04?'#dc2626':z.density>0.02?'#d97706':'#16a34a' }}>
                      {z.density}/cmÂ²
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
                  <div style={{ width:`${z.good}%`, background:'#2563eb', borderRadius:'99px 0 0 99px' }}/>
                  <div style={{ width:`${z.defect}%`, background:'#ef4444', borderRadius:'0 99px 99px 0' }}/>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] text-blue-600 font-medium">{z.good}% good</span>
                  <span className="text-[9px] text-red-500 font-medium">{z.defect}% defect</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inspection escape rate */}
        <div className="card p-5 anim-fade-up" style={{ animationDelay:'280ms', borderTop:'3px solid #16a34a' }}>
          <h2 className="text-sm font-semibold text-slate-800 mb-0.5 flex items-center gap-2">
            <Target size={14} className="text-green-600"/>Inspection Capture &amp; Escape Rate
          </h2>
          <p className="text-[10px] text-slate-500 mb-4">Defect detection effectiveness by inspection step</p>
          <div className="space-y-3">
            {inspectionEscape.map(s => (
              <div key={s.step}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-700 font-medium">{s.step}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-green-700 font-semibold">{s.captured}% captured</span>
                    <span className="text-[9px] text-red-500 font-semibold">{s.escaped}% escaped</span>
                  </div>
                </div>
                <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden">
                  <div style={{ width:`${s.captured}%`, background:'#16a34a', borderRadius:'99px 0 0 99px' }}/>
                  <div style={{ width:`${s.escaped}%`, background:'#fecaca', borderRadius:'0 99px 99px 0' }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-600"/>
              <span className="text-[10px] text-slate-600">Overall Capture Rate: <span className="font-bold text-green-700">98.4%</span></span>
            </div>
            <span className="badge badge-green">Excellent</span>
          </div>
        </div>
      </div>

      {/* Root Cause Analysis */}
      <div className="card overflow-hidden anim-fade-up" style={{ animationDelay:'300ms' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Activity size={14} className="text-amber-600"/>Root Cause Analysis (RCA)
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{rootCauses.length} identified root causes Â· Click row for mitigation</p>
          </div>
          <span className="badge badge-amber"><AlertTriangle size={9}/>{rootCauses.filter(r=>r.risk==='High').length} High Risk</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Root Cause</th><th>Process Step</th><th>Defects</th>
                <th>Risk</th><th>Est. Cost/Month</th><th>Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {rootCauses.map((r, i) => {
                const rc = RISK_CFG[r.risk]
                return (
                  <tr key={i} onClick={() => setActiveRCA(activeRCA===i?null:i)} className="cursor-pointer">
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.icon}</span>
                        <span className="font-semibold text-slate-700 text-[11px]">{r.cause}</span>
                      </div>
                    </td>
                    <td className="text-slate-500 text-[10px]">{r.process}</td>
                    <td className="font-bold text-slate-800">{r.defects}</td>
                    <td>
                      <span className="badge" style={{ background:rc.bg, color:rc.color, borderColor:rc.border }}>
                        {r.risk}
                      </span>
                    </td>
                    <td className="font-bold text-red-600">{fmtINR(r.cost)}</td>
                    <td>
                      {activeRCA===i
                        ? <p className="text-[10px] text-blue-700 font-medium max-w-xs">{r.mitigation}</p>
                        : <span className="text-[9px] text-slate-400 italic">Click to expand â†’</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Defect log */}
      <div className="card overflow-hidden anim-fade-up" style={{ animationDelay:'350ms' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Defect Log</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{defectTable.length} defect types tracked this period</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-green-600"/>
            <span className="text-[10px] text-slate-600">Inspection: <span className="font-bold text-green-700">98.4%</span></span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Defect Type</th><th>Count</th><th>Severity</th><th>Location</th><th>Trend</th></tr>
            </thead>
            <tbody>
              {defectTable.map((r, i) => (
                <tr key={r.id}>
                  <td className="text-slate-400 font-mono text-[10px]">{String(i+1).padStart(2,'0')}</td>
                  <td className="font-medium text-slate-700">{r.type}</td>
                  <td className="font-bold text-slate-800">{r.count}</td>
                  <td>
                    <span className="badge" style={{ background:SEV_BG[r.severity], color:SEV_COLORS[r.severity], borderColor:SEV_BORDER[r.severity] }}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="text-slate-500">{r.location}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
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


