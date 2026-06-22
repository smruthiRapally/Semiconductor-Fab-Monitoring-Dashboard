import React from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from 'recharts'
import { TrendingUp, Award, TrendingDown, Target, Zap, Radio } from 'lucide-react'
import { dailyYield, weeklyYield, monthlyYield, yieldKPIs } from '../data/mockData'

/* ── Wafer yield donut ────────────────────────── */
function YieldDonut({ pct, size=120 }) {
  const r = size / 2 - 12
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="yieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth="10" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#yieldGrad)" strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition:'stroke-dashoffset 1.2s ease', filter:'drop-shadow(0 0 6px #2563eb)' }}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2-4} textAnchor="middle" fontSize="18" fontWeight="900" fill="#60a5fa">{pct}</text>
      <text x={size/2} y={size/2+12} textAnchor="middle" fontSize="9" fill="#475569">AVG YIELD %</text>
    </svg>
  )
}

const kpiIcons = [TrendingUp, Award, TrendingDown, Target]
const kpiColors = ['#2563eb','#10b981','#ef4444','#8b5cf6']
const kpiGlows  = ['rgba(37,99,235,0.3)','rgba(16,185,129,0.3)','rgba(239,68,68,0.3)','rgba(139,92,246,0.3)']

const FabTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-sm font-bold" style={{ color:p.color || '#60a5fa' }}>
          {p.value}%
        </p>
      ))}
    </div>
  )
}

export default function YieldAnalysis() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            <span className="gradient-text-cyan">Yield</span> Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Radio size={10} className="text-green-400 live-dot" />
            Wafer yield performance across time periods
          </p>
        </div>
        <span className="fab-badge badge-green"><Zap size={9} />TARGET: 96%</span>
      </div>

      {/* KPI + Donut row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Donut */}
        <div className="md:col-span-1 glass rounded-2xl p-5 flex flex-col items-center justify-center anim-fade-up">
          <YieldDonut pct={95.7} size={130} />
          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Industry Avg</p>
            <p className="text-xs text-slate-400 font-bold">94.2%</p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {yieldKPIs.map((k, i) => {
            const Icon = kpiIcons[i]
            return (
              <div key={k.label} className="glass rounded-2xl p-4 relative overflow-hidden anim-fade-up stat-card-fab"
                style={{ animationDelay:`${i*80}ms`, border:`1px solid ${kpiColors[i]}20` }}>
                <div className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background:`linear-gradient(90deg,transparent,${kpiColors[i]},transparent)` }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background:`${kpiColors[i]}18`, border:`1px solid ${kpiColors[i]}35`, boxShadow:`0 0 12px ${kpiGlows[i]}` }}>
                  <Icon size={16} style={{ color:kpiColors[i] }} />
                </div>
                <p className="text-xl font-black" style={{ color:kpiColors[i], textShadow:`0 0 16px ${kpiGlows[i]}` }}>{k.value}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">{k.label}</p>
                <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                  style={{ background:`radial-gradient(ellipse at 50% 100%,${kpiGlows[i]} 0%,transparent 70%)` }} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily + Weekly charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily line */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'150ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#2563eb,transparent)' }} />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Daily Yield Rate</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Mon – Fri this week</p>
            </div>
            <span className="fab-badge badge-blue">DAILY</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyYield} margin={{ top:5, right:10, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#475569' }} axisLine={false} tickLine={false} />
              <YAxis domain={[92,98]} tick={{ fontSize:10, fill:'#475569' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
              <Tooltip content={<FabTooltip />} />
              <ReferenceLine y={96} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1}
                label={{ value:'Target',fontSize:9,fill:'#10b981',position:'right' }} />
              <Line type="monotone" dataKey="yield" stroke="#2563eb" strokeWidth={2.5}
                dot={{ fill:'#2563eb', r:4, strokeWidth:2, stroke:'#93c5fd' }}
                activeDot={{ r:6, fill:'#60a5fa' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly bar */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'220ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#10b981,transparent)' }} />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Weekly Yield Rate</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Last 4 weeks</p>
            </div>
            <span className="fab-badge badge-green">WEEKLY</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyYield} margin={{ top:5, right:10, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize:10, fill:'#475569' }} axisLine={false} tickLine={false} />
              <YAxis domain={[93,98]} tick={{ fontSize:10, fill:'#475569' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
              <Tooltip content={<FabTooltip />} />
              <ReferenceLine y={96} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />
              <Bar dataKey="yield" radius={[5,5,0,0]} maxBarSize={48}>
                {weeklyYield.map((d, i) => (
                  <Cell key={i} fill={`rgba(37,99,235,${0.4+i*0.15})`}
                    style={{ filter:`drop-shadow(0 0 6px rgba(37,99,235,0.4))` }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly area */}
      <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'300ms' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5 shimmer-line opacity-50" />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-white">Monthly Yield Trend</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Jan – Jun cumulative improvement</p>
          </div>
          <div className="flex gap-2">
            <span className="fab-badge badge-indigo">6-MONTH</span>
            <span className="fab-badge badge-green">+3.5pp</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyYield} margin={{ top:5, right:20, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:'#475569' }} axisLine={false} tickLine={false} />
            <YAxis domain={[91,98]} tick={{ fontSize:10, fill:'#475569' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
            <Tooltip content={<FabTooltip />} />
            <ReferenceLine y={96} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1.5}
              label={{ value:'96% Target', fontSize:9, fill:'#10b981', position:'insideTopRight' }} />
            <Area type="monotone" dataKey="yield" stroke="#2563eb" strokeWidth={2.5}
              fill="url(#monthGrad)"
              dot={{ fill:'#2563eb', r:4, strokeWidth:2, stroke:'#93c5fd' }}
              activeDot={{ r:6 }} />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4" style={{ borderTop:'1px solid rgba(59,130,246,0.1)' }}>
          {[
            { l:'Jan Baseline', v:'93.0%', c:'#f87171' },
            { l:'Jun Current',  v:'96.5%', c:'#4ade80' },
            { l:'Improvement',  v:'+3.5pp', c:'#60a5fa' },
          ].map(s => (
            <div key={s.l} className="text-center p-3 rounded-xl" style={{ background:'rgba(15,23,42,0.5)', border:'1px solid rgba(59,130,246,0.08)' }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">{s.l}</p>
              <p className="text-base font-black mt-1" style={{ color:s.c }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
