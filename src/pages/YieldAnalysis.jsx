import React from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { TrendingUp, Award, TrendingDown, Target, Zap, Radio } from 'lucide-react'
import { dailyYield, weeklyYield, monthlyYield, yieldKPIs } from '../data/mockData'
import PageHero from '../components/PageHero'
const HERO_IMG = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80&fit=crop'

function YieldDonut({ pct, size=120 }) {
  const r = size/2-12
  const circ = 2*Math.PI*r
  const offset = circ-(pct/100)*circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="yieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0891b2"/>
          <stop offset="100%" stopColor="#2563eb"/>
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#yieldGrad)" strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition:'stroke-dashoffset 1.2s ease' }}
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2-4} textAnchor="middle" fontSize="18" fontWeight="900" fill="#1d4ed8">{pct}</text>
      <text x={size/2} y={size/2+12} textAnchor="middle" fontSize="9" fill="#94a3b8">AVG YIELD %</text>
    </svg>
  )
}

const kpiIcons  = [TrendingUp, Award, TrendingDown, Target]
const kpiColors = ['#2563eb','#16a34a','#dc2626','#7c3aed']
const kpiBgs    = ['#eff6ff','#f0fdf4','#fef2f2','#f5f3ff']

const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2">
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-sm font-bold" style={{ color:p.color||'#2563eb' }}>{p.value}%</p>
      ))}
    </div>
  )
}

export default function YieldAnalysis() {
  return (
    <div>
      <PageHero src={HERO_IMG} badge="Performance Analytics · Live" title="Yield Analysis" accent="96.5% Current" sub="Wafer yield performance across daily, weekly and monthly time periods." />

      {/* ── KPI + Donut — green tint ── */}
      <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', padding:'28px 0 24px' }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-2">
          <div className="md:col-span-1 card p-5 flex flex-col items-center justify-center anim-fade-up">
            <YieldDonut pct={95.7} size={130}/>
            <div className="mt-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Industry Avg</p>
              <p className="text-xs text-slate-600 font-semibold">94.2%</p>
            </div>
          </div>
          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {yieldKPIs.map((k,i) => {
              const Icon = kpiIcons[i]
              return (
                <div key={k.label} className="stat-card card-lift anim-fade-up"
                  style={{ animationDelay:`${i*80}ms`, borderTop:`3px solid ${kpiColors[i]}` }}>
                  <div className="icon-box rounded-xl mb-3" style={{ background:kpiBgs[i], color:kpiColors[i] }}>
                    <Icon size={16}/>
                  </div>
                  <p className="text-xl font-bold" style={{ color:kpiColors[i] }}>{k.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-1 font-medium">{k.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Charts — white ── */}
      <div style={{ background:'#fff', padding:'28px 0 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-2">
          <div className="card p-5 anim-fade-up" style={{ animationDelay:'150ms', borderTop:'3px solid #2563eb' }}>
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-sm font-semibold text-slate-800">Daily Yield Rate</h2><p className="text-[10px] text-slate-500 mt-0.5">Mon – Fri this week</p></div>
              <span className="badge badge-blue">Daily</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyYield} margin={{ top:5, right:10, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                <YAxis domain={[92,98]} tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <Tooltip content={<ChartTip/>}/>
                <ReferenceLine y={96} stroke="#16a34a" strokeDasharray="3 3" strokeWidth={1} label={{ value:'Target', fontSize:9, fill:'#16a34a', position:'right' }}/>
                <Line type="monotone" dataKey="yield" stroke="#2563eb" strokeWidth={2.5} dot={{ fill:'#2563eb', r:4, strokeWidth:2, stroke:'#bfdbfe' }} activeDot={{ r:6, fill:'#1d4ed8' }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5 anim-fade-up" style={{ animationDelay:'220ms', borderTop:'3px solid #16a34a' }}>
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-sm font-semibold text-slate-800">Weekly Yield Rate</h2><p className="text-[10px] text-slate-500 mt-0.5">Last 4 weeks</p></div>
              <span className="badge badge-green">Weekly</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyYield} margin={{ top:5, right:10, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="week" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                <YAxis domain={[93,98]} tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <Tooltip content={<ChartTip/>}/>
                <ReferenceLine y={96} stroke="#16a34a" strokeDasharray="3 3" strokeWidth={1}/>
                <Bar dataKey="yield" radius={[5,5,0,0]} maxBarSize={48}>
                  {weeklyYield.map((_,i) => <Cell key={i} fill={`rgba(37,99,235,${0.4+i*0.15})`}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Image banner ── */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:180, display:'flex', alignItems:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url('${HERO_IMG}')`, backgroundSize:'cover', backgroundPosition:'center', zIndex:0 }}/>
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(90deg,rgba(5,10,30,0.92) 0%,rgba(5,10,30,0.65) 55%,rgba(5,10,30,0.15) 100%)' }}/>
        <div style={{ position:'relative', zIndex:2, padding:'28px 40px' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#86efac', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>Yield Intelligence</p>
          <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(1.3rem,2.2vw,1.8rem)', fontWeight:800, color:'#fff', marginBottom:6 }}>
            93% → 96.5%.<br/><span style={{ color:'#bbf7d0' }}>+3.5pp Improvement This Quarter.</span>
          </h3>
          <p style={{ fontSize:'0.82rem', color:'rgba(203,213,225,0.85)', maxWidth:460 }}>Consistent yield improvement driven by real-time defect feedback loops and process optimization.</p>
        </div>
      </div>

      {/* ── Monthly trend — indigo tint ── */}
      <div style={{ background:'linear-gradient(135deg,#eef2ff,#e0e7ff)', padding:'28px 0 24px' }}>
        <div className="card p-5 mx-2" style={{ borderTop:'3px solid #7c3aed' }}>
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="text-sm font-semibold text-slate-800">Monthly Yield Trend</h2><p className="text-[10px] text-slate-500 mt-0.5">Jan – Jun cumulative improvement</p></div>
            <div className="flex gap-2"><span className="badge badge-purple">6-Month</span><span className="badge badge-green">+3.5pp</span></div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyYield} margin={{ top:5, right:20, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[91,98]} tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={<ChartTip/>}/>
              <ReferenceLine y={96} stroke="#16a34a" strokeDasharray="3 3" strokeWidth={1.5} label={{ value:'96% Target', fontSize:9, fill:'#16a34a', position:'insideTopRight' }}/>
              <Area type="monotone" dataKey="yield" stroke="#2563eb" strokeWidth={2.5} fill="url(#monthGrad)" dot={{ fill:'#2563eb', r:4, strokeWidth:2, stroke:'#bfdbfe' }} activeDot={{ r:6 }}/>
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
            {[{l:'Jan Baseline',v:'93.0%',c:'#dc2626',bg:'#fef2f2'},{l:'Jun Current',v:'96.5%',c:'#16a34a',bg:'#f0fdf4'},{l:'Improvement',v:'+3.5pp',c:'#2563eb',bg:'#eff6ff'}].map(s => (
              <div key={s.l} className="text-center p-3 rounded-xl border" style={{ background:s.bg, borderColor:`${s.c}20` }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">{s.l}</p>
                <p className="text-base font-bold mt-1" style={{ color:s.c }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

