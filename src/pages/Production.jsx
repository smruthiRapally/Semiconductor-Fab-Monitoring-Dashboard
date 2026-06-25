import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Layers, Zap, Activity, Package, ChevronRight, CheckCircle, AlertCircle, Clock, Radio } from 'lucide-react'
import { processStages, productionSummary, hourlyProduction } from '../data/mockData'
import PageHero from '../components/PageHero'
const HERO_IMG = 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=80&fit=crop'

const stageAccents = ['#0891b2','#d97706','#16a34a','#7c3aed']
const stageBgs     = ['#ecfeff','#fffbeb','#f0fdf4','#f5f3ff']
const stageIcons   = [Layers, Zap, Activity, Package]

function getStatusCfg(p) {
  if (p >= 90) return { label:'On Track', cls:'badge-green', icon:CheckCircle, color:'#16a34a' }
  if (p >= 80) return { label:'Caution',  cls:'badge-amber', icon:Clock,       color:'#d97706' }
  return            { label:'Behind',   cls:'badge-red',   icon:AlertCircle,  color:'#dc2626' }
}

function HexNode({ label, pct, icon:Icon, accent, active, bg }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 border-2"
        style={{
          background: active ? bg : '#f8fafc',
          borderColor: active ? accent : '#e2e8f0',
          boxShadow: active ? `0 4px 12px ${accent}30` : 'none',
        }}>
        <Icon size={22} style={{ color:accent }}/>
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
          style={{ background:accent }}>{pct}%</div>
      </div>
      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  )
}

function StageCard({ stage, accent, bg, index }) {
  const [anim, setAnim] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnim(true), index*150+200); return () => clearTimeout(t) }, [index])
  const s = getStatusCfg(stage.progress)
  const Icon = stageIcons[index]
  const StatusIcon = s.icon
  return (
    <div className="card p-5 overflow-hidden relative anim-fade-up"
      style={{ animationDelay:`${index*100}ms`, borderTop:`3px solid ${accent}` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-box rounded-xl" style={{ background:bg, color:accent }}>
            <Icon size={17}/>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{stage.name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{stage.description}</p>
          </div>
        </div>
        <span className={`badge ${s.cls} flex items-center gap-1`}>
          <StatusIcon size={9}/>{s.label}
        </span>
      </div>
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Progress</span>
          <span className="text-sm font-bold" style={{ color:accent }}>{stage.progress}%</span>
        </div>
        <div className="progress-track h-3">
          <div className="progress-fill" style={{ width:anim?`${stage.progress}%`:'0%', background:accent }}/>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
        {[
          { l:'Completed', v:stage.wafers.toLocaleString() },
          { l:'Target',    v:stage.target.toLocaleString() },
          { l:'Remaining', v:(stage.target-stage.wafers).toLocaleString() },
        ].map(item => (
          <div key={item.l} className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">{item.l}</p>
            <p className="text-xs font-bold text-slate-700 mt-0.5">{item.v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2">
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-blue-600">{payload[0].value} wafers</p>
    </div>
  )
}

export default function Production() {
  const [activeStage, setActiveStage] = useState(0)
  return (
    <div>
      <PageHero src={HERO_IMG} badge="Manufacturing · Shift A Active" title="Production Flow" accent="Real-Time Stage Monitoring" sub="Semiconductor manufacturing pipeline — lithography, etching, deposition and packaging." />

      {/* ── Section 1: Stats strip — blue tint ── */}
      <div style={{ background:'linear-gradient(135deg,#eff6ff,#dbeafe)', padding:'28px 0 24px', marginBottom:0 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-2">
          {productionSummary.map((item,i) => (
            <div key={item.label} className="stat-card text-center anim-fade-up" style={{ animationDelay:`${i*60}ms` }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium leading-tight">{item.label}</p>
              <p className="text-base font-bold text-slate-800 mt-1">
                {item.value}{item.unit && <span className="text-xs text-slate-400 ml-0.5 font-normal">{item.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Pipeline — white ── */}
      <div style={{ background:'#fff', padding:'28px 0 24px' }}>
        <div className="card p-5 overflow-hidden mx-2">
          <h2 className="text-sm font-semibold text-slate-800 mb-5">Manufacturing Pipeline</h2>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
            {processStages.map((s,i) => (
              <React.Fragment key={s.id}>
                <button onClick={() => setActiveStage(i)}>
                  <HexNode label={s.name} pct={s.progress} icon={stageIcons[i]} accent={stageAccents[i]} bg={stageBgs[i]} active={activeStage===i}/>
                </button>
                {i < processStages.length-1 && (
                  <div className="flex items-center">
                    <div className="w-8 h-px bg-slate-200"/>
                    <ChevronRight size={12} className="text-slate-300"/>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {[['#16a34a','On Track (≥90%)'],['#d97706','Caution (80–89%)'],['#dc2626','Behind (<80%)']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background:c }}/>
                <span className="text-[10px] text-slate-500">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Image banner ── */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:200, display:'flex', alignItems:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url('${HERO_IMG}')`, backgroundSize:'cover', backgroundPosition:'center 30%', zIndex:0 }}/>
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(90deg,rgba(5,10,30,0.92) 0%,rgba(5,10,30,0.65) 55%,rgba(5,10,30,0.2) 100%)' }}/>
        <div style={{ position:'relative', zIndex:2, padding:'32px 40px', maxWidth:600 }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#93c5fd', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Stage Performance</p>
          <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(1.4rem,2.5vw,1.9rem)', fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:10 }}>
            4 Active Stages.<br/><span style={{ color:'#60a5fa' }}>All Monitored Live.</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {[{v:'12,500',l:'Wafers Today'},{v:'97.3%',l:'On-Time'},{v:'18.5h',l:'Cycle Time'}].map(s => (
              <div key={s.l} style={{ textAlign:'center', minWidth:80 }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#fff', fontFamily:"'Space Grotesk',sans-serif" }}>{s.v}</div>
                <div style={{ fontSize:'0.65rem', color:'rgba(148,163,184,0.9)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Stage cards — indigo tint ── */}
      <div style={{ background:'linear-gradient(135deg,#eef2ff,#e0e7ff)', padding:'28px 0 24px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
          {processStages.map((s,i) => <StageCard key={s.id} stage={s} accent={stageAccents[i]} bg={stageBgs[i]} index={i}/>)}
        </div>
      </div>

      {/* ── Section 4: Hourly chart — white ── */}
      <div style={{ background:'#fff', padding:'28px 0 24px' }}>
        <div className="card p-5 mx-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Hourly Throughput</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Wafers produced per hour today</p>
            </div>
            <span className="badge badge-blue">Today</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyProduction} margin={{ top:5, right:10, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="hour" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} domain={[400,650]}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="wafers" radius={[4,4,0,0]} maxBarSize={28}>
                {hourlyProduction.map((_,i) => <Cell key={i} fill={`rgba(37,99,235,${0.4+(i/hourlyProduction.length)*0.5})`}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
