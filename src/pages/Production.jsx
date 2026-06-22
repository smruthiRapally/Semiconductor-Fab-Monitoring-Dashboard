import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import {
  Layers, Zap, Activity, Package, ChevronRight,
  CheckCircle, AlertCircle, Clock, Radio,
} from 'lucide-react'
import { processStages, productionSummary, hourlyProduction } from '../data/mockData'

const stageAccents = ['#06b6d4','#f59e0b','#10b981','#8b5cf6']
const stageIcons = [Layers, Zap, Activity, Package]

function getStatusCfg(p) {
  if (p >= 90) return { label:'ON TRACK', cls:'badge-green', icon:CheckCircle, color:'#4ade80' }
  if (p >= 80) return { label:'CAUTION',  cls:'badge-amber', icon:Clock,       color:'#fbbf24' }
  return            { label:'BEHIND',   cls:'badge-red',   icon:AlertCircle,  color:'#f87171' }
}

/* ── Hex stage node ───────────────────────────── */
function HexNode({ label, pct, icon:Icon, accent, active }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
        style={{
          background: active ? `${accent}25` : 'rgba(15,23,42,0.6)',
          border: `2px solid ${active ? accent : 'rgba(59,130,246,0.15)'}`,
          boxShadow: active ? `0 0 20px ${accent}40` : 'none',
        }}>
        <Icon size={22} style={{ color: accent }} />
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black"
          style={{ background:accent, color:'#020817' }}>{pct}%</div>
      </div>
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  )
}

/* ── Progress stage card ──────────────────────── */
function StageCard({ stage, accent, index }) {
  const [anim, setAnim] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnim(true), index * 150 + 200); return () => clearTimeout(t) }, [index])
  const s = getStatusCfg(stage.progress)
  const Icon = stageIcons[index]
  const StatusIcon = s.icon

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up"
      style={{ animationDelay:`${index*100}ms`, border:`1px solid ${accent}20` }}>
      {/* top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background:`linear-gradient(90deg,transparent,${accent},transparent)` }} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:`${accent}20`, border:`1px solid ${accent}35` }}>
            <Icon size={17} style={{ color:accent }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{stage.name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{stage.description}</p>
          </div>
        </div>
        <span className={`fab-badge ${s.cls}`}>
          <StatusIcon size={9} />
          {s.label}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Progress</span>
          <span className="text-sm font-black" style={{ color:accent }}>{stage.progress}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
          <div className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: anim ? `${stage.progress}%` : '0%',
              background:`linear-gradient(90deg,${accent}80,${accent})`,
              boxShadow:`0 0 10px ${accent}60`,
            }} />
        </div>
      </div>

      {/* Wafer stats */}
      <div className="grid grid-cols-3 gap-2 pt-3"
        style={{ borderTop:`1px solid ${accent}15` }}>
        {[
          { l:'Completed', v:stage.wafers.toLocaleString() },
          { l:'Target',    v:stage.target.toLocaleString() },
          { l:'Remaining', v:(stage.target-stage.wafers).toLocaleString() },
        ].map(item => (
          <div key={item.l} className="text-center p-2 rounded-lg" style={{ background:'rgba(15,23,42,0.5)' }}>
            <p className="text-[9px] text-slate-600 uppercase tracking-wider">{item.l}</p>
            <p className="text-xs font-bold text-slate-200 mt-0.5">{item.v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Tooltip ──────────────────────────────────── */
const FabTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-cyan-300">{payload[0].value} wafers</p>
    </div>
  )
}

export default function Production() {
  const [activeStage, setActiveStage] = useState(0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            <span className="gradient-text-cyan">Production</span> Flow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Radio size={10} className="text-green-400 live-dot" />
            Semiconductor manufacturing stage monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <span className="fab-badge badge-cyan">SHIFT A</span>
          <span className="fab-badge badge-green">TARGET: 13,000</span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {productionSummary.map((item, i) => (
          <div key={item.label} className="glass rounded-xl p-3 text-center anim-fade-up" style={{ animationDelay:`${i*60}ms` }}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-tight">{item.label}</p>
            <p className="text-base font-black text-white mt-1">
              {item.value}
              {item.unit && <span className="text-xs text-slate-500 ml-0.5 font-normal">{item.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Flow diagram */}
      <div className="glass rounded-2xl p-5 overflow-hidden relative anim-fade-up" style={{ animationDelay:'120ms' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5 shimmer-line opacity-40" />
        <h2 className="text-sm font-bold text-white mb-5">Manufacturing Pipeline</h2>

        {/* Flow nodes */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
          {processStages.map((s, i) => (
            <React.Fragment key={s.id}>
              <button onClick={() => setActiveStage(i)}>
                <HexNode label={s.name} pct={s.progress} icon={stageIcons[i]}
                  accent={stageAccents[i]} active={activeStage === i} />
              </button>
              {i < processStages.length - 1 && (
                <div className="flex items-center">
                  <div className="w-8 h-px" style={{ background:'linear-gradient(90deg,rgba(59,130,246,0.3),rgba(6,182,212,0.3))' }} />
                  <ChevronRight size={12} className="text-slate-600" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center">
          {[['#4ade80','On Track (≥90%)'],['#fbbf24','Caution (80–89%)'],['#f87171','Behind (<80%)']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background:c }} />
              <span className="text-[10px] text-slate-500">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {processStages.map((s, i) => (
          <StageCard key={s.id} stage={s} accent={stageAccents[i]} index={i} />
        ))}
      </div>

      {/* Hourly throughput */}
      <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'200ms' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5 shimmer-line opacity-40" />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-white">Hourly Throughput</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Wafers produced per hour today</p>
          </div>
          <span className="fab-badge badge-blue">TODAY</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyProduction} margin={{ top:5, right:10, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize:10, fill:'#475569' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:'#475569' }} axisLine={false} tickLine={false} domain={[400,650]} />
            <Tooltip content={<FabTooltip />} />
            <Bar dataKey="wafers" radius={[4,4,0,0]} maxBarSize={28}>
              {hourlyProduction.map((_, i) => (
                <Cell key={i} fill={`rgba(37,99,235,${0.4 + (i/hourlyProduction.length)*0.5})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
