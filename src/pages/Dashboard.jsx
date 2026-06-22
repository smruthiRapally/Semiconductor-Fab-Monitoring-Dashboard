import React, { useState, useEffect, useRef } from 'react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Layers, TrendingUp, Cpu, AlertTriangle, Zap, Radio,
  ArrowUpRight, ArrowDownRight, Clock, Package,
  CheckCircle, ChevronRight, Timer, CalendarClock,
  FlaskConical, Microscope, CircuitBoard, Boxes,
  Building2, Star, Truck, AlertCircle,
} from 'lucide-react'
import { productionTrend } from '../data/mockData'

/* ════════════════════════════════════════════════
   SECTION 1 — HELPERS / SHARED
═══════════════════════════════════════════════ */
function CircuitLines() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="40%" x2="30%" y2="40%" stroke="#60a5fa" strokeWidth="0.5"/>
      <line x1="30%" y1="40%" x2="30%" y2="60%" stroke="#60a5fa" strokeWidth="0.5"/>
      <line x1="30%" y1="60%" x2="60%" y2="60%" stroke="#60a5fa" strokeWidth="0.5"/>
      <line x1="70%" y1="20%" x2="100%" y2="20%" stroke="#22d3ee" strokeWidth="0.5"/>
      <line x1="70%" y1="20%" x2="70%" y2="80%" stroke="#22d3ee" strokeWidth="0.5"/>
      <circle cx="30%" cy="40%" r="3" fill="#60a5fa"/>
      <circle cx="30%" cy="60%" r="3" fill="#60a5fa"/>
      <circle cx="70%" cy="20%" r="3" fill="#22d3ee"/>
      <circle cx="70%" cy="80%" r="3" fill="#22d3ee"/>
    </svg>
  )
}

const FabTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-cyan-300">{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

/* ════════════════════════════════════════════════
   SECTION 2 — KPI CARDS
═══════════════════════════════════════════════ */
const kpiConfig = [
  { label:'Wafers Produced', value:'12,500', change:'+4.2%', pos:true,  icon:Layers,       accent:'#2563eb', glow:'rgba(37,99,235,0.3)'   },
  { label:'Yield Rate',      value:'96.5%',  change:'+0.3%', pos:true,  icon:TrendingUp,   accent:'#06b6d4', glow:'rgba(6,182,212,0.3)'   },
  { label:'Active Machines', value:'42',     change:'+2',    pos:true,  icon:Cpu,          accent:'#8b5cf6', glow:'rgba(139,92,246,0.3)'  },
  { label:'Defect Rate',     value:'0.8%',   change:'-0.1%', pos:true,  icon:AlertTriangle,accent:'#10b981', glow:'rgba(16,185,129,0.3)'  },
]

function KpiCard({ label, value, change, pos, icon:Icon, accent, glow, delay=0 }) {
  return (
    <div className="relative overflow-hidden rounded-2xl glass stat-card-fab anim-fade-up p-5 cursor-default"
      style={{ animationDelay:`${delay}ms`, border:`1px solid ${accent}25` }}>
      <CircuitLines/>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:`linear-gradient(90deg,transparent,${accent},transparent)` }}/>
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background:`${accent}20`, border:`1px solid ${accent}40`, boxShadow:`0 0 16px ${glow}` }}>
          <Icon size={18} style={{ color:accent }}/>
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${pos?'text-green-400':'text-red-400'}`}>
          {pos ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
          {change}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-black text-white leading-none" style={{ textShadow:`0 0 20px ${glow}` }}>{value}</p>
        <p className="text-xs text-slate-500 mt-1.5 uppercase tracking-widest">{label}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background:`radial-gradient(ellipse at 50% 100%,${glow} 0%,transparent 70%)` }}/>
    </div>
  )
}

/* ════════════════════════════════════════════════
   SECTION 3 — LIVE PRODUCTION TRACKER
═══════════════════════════════════════════════ */
const PIPELINE_STAGES = [
  { id:'raw',    label:'Raw Wafer',   icon:FlaskConical,  color:'#64748b' },
  { id:'litho',  label:'Lithography', icon:Microscope,    color:'#06b6d4' },
  { id:'etch',   label:'Etching',     icon:Zap,           color:'#f59e0b' },
  { id:'test',   label:'Testing',     icon:CircuitBoard,  color:'#8b5cf6' },
  { id:'pack',   label:'Packaging',   icon:Package,       color:'#10b981' },
  { id:'done',   label:'Completed',   icon:CheckCircle,   color:'#4ade80' },
]

const ACTIVE_ORDER = {
  orderId:      'WO-2024-0187',
  customer:     'TechSemi Corp',
  product:      '28nm Logic Wafers',
  totalWafers:  25000,
  startDate:    '2024-06-18T08:00:00',
  currentStage: 'etch',       // one of the stage ids
  stageProgress:68,           // % within current stage
  wafersCompleted: 17340,
  estimatedEndDate:'2024-06-25T16:00:00',
  priority:    'HIGH',
}

function useCountdown(targetDateStr) {
  const [remaining, setRemaining] = useState('')
  const [hours, setHours]         = useState(0)
  const [days, setDays]           = useState(0)
  useEffect(() => {
    function calc() {
      const diff = new Date(targetDateStr) - new Date()
      if (diff <= 0) { setRemaining('Completed'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000)  / 60000)
      setDays(d); setHours(h)
      setRemaining(`${d}d ${h}h ${m}m`)
    }
    calc()
    const iv = setInterval(calc, 60000)
    return () => clearInterval(iv)
  }, [targetDateStr])
  return { remaining, hours, days }
}

function LiveProductionTracker() {
  const o = ACTIVE_ORDER
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t) }, [])

  const { remaining } = useCountdown(o.estimatedEndDate)
  const overallPct = Math.round((o.wafersCompleted / o.totalWafers) * 100)
  const wafersRemaining = o.totalWafers - o.wafersCompleted

  const activeIdx   = PIPELINE_STAGES.findIndex(s => s.id === o.currentStage)
  const startFmt    = new Date(o.startDate).toLocaleString('en-IN',{ day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false })
  const endFmt      = new Date(o.estimatedEndDate).toLocaleString('en-IN',{ day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false })

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'240ms' }}>
      {/* top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background:'linear-gradient(90deg,transparent,#06b6d4,#8b5cf6,transparent)' }}/>
      {/* bg glow */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
        style={{ background:'radial-gradient(circle at 100% 0%,rgba(6,182,212,0.06) 0%,transparent 60%)' }}/>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background:'linear-gradient(180deg,#06b6d4,#8b5cf6)' }}/>
            <h2 className="text-sm font-bold text-white">Live Production Tracker</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 ml-3.5">
            <span className="text-[10px] text-slate-500">Order <span className="text-cyan-400 font-bold">{o.orderId}</span></span>
            <span className="text-[10px] text-slate-500">·</span>
            <span className="text-[10px] text-slate-500">{o.customer}</span>
            <span className="text-[10px] text-slate-500">·</span>
            <span className="text-[10px] text-slate-400 font-medium">{o.product}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="fab-badge" style={{ background:'rgba(245,158,11,0.15)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.35)' }}>
            <Zap size={8}/>{o.priority} PRIORITY
          </span>
          <span className="fab-badge badge-cyan">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 live-dot inline-block"/>LIVE
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { l:'Total Order',       v:o.totalWafers.toLocaleString('en-IN'),    unit:'wafers', c:'#60a5fa', icon:Layers },
          { l:'Completed',         v:o.wafersCompleted.toLocaleString('en-IN'),unit:'wafers', c:'#4ade80', icon:CheckCircle },
          { l:'Remaining',         v:wafersRemaining.toLocaleString('en-IN'),  unit:'wafers', c:'#f87171', icon:Timer },
          { l:'Est. Completion',   v:remaining,                               unit:'',       c:'#fbbf24', icon:CalendarClock },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.l} className="rounded-xl p-3 relative overflow-hidden"
              style={{ background:`${s.c}08`, border:`1px solid ${s.c}20` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={12} style={{ color:s.c }}/>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">{s.l}</span>
              </div>
              <p className="text-sm font-black leading-tight" style={{ color:s.c }}>
                {s.v}
                {s.unit && <span className="text-[9px] text-slate-500 ml-1 font-normal">{s.unit}</span>}
              </p>
            </div>
          )
        })}
      </div>

      {/* Overall progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Overall Completion</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-cyan-300">{overallPct}%</span>
            <span className="fab-badge badge-cyan">{animated ? overallPct : 0}% DONE</span>
          </div>
        </div>
        <div className="relative h-4 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.9)' }}>
          {/* segmented bg */}
          <div className="absolute inset-0 flex">
            {PIPELINE_STAGES.map((s,i) => (
              <div key={s.id} className="flex-1 border-r border-black/20 last:border-0" style={{ background:`${s.color}08` }}/>
            ))}
          </div>
          {/* fill */}
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1500 ease-out"
            style={{
              width: animated ? `${overallPct}%` : '0%',
              background:'linear-gradient(90deg,#1d4ed8,#0891b2,#06b6d4)',
              boxShadow:'0 0 12px rgba(6,182,212,0.6)',
            }}/>
          {/* shimmer */}
          <div className="absolute inset-y-0 left-0 w-full pointer-events-none shimmer-line opacity-30 rounded-full"/>
        </div>
        {/* stage labels */}
        <div className="flex justify-between mt-1">
          {PIPELINE_STAGES.map(s => (
            <span key={s.id} className="text-[8px] text-slate-600 uppercase tracking-wider"
              style={{ color: s.id === o.currentStage ? s.color : undefined }}>{s.label.split(' ')[0]}</span>
          ))}
        </div>
      </div>

      {/* Pipeline timeline */}
      <div className="relative">
        <div className="flex items-center justify-between relative">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-5 h-0.5 z-0"
            style={{ background:'linear-gradient(90deg,rgba(59,130,246,0.15),rgba(59,130,246,0.15))' }}/>
          {/* completed fill */}
          <div className="absolute left-0 top-5 h-0.5 z-0 transition-all duration-1500"
            style={{
              width: animated ? `${(activeIdx / (PIPELINE_STAGES.length-1)) * 100}%` : '0%',
              background:'linear-gradient(90deg,#1d4ed8,#06b6d4)',
              boxShadow:'0 0 6px rgba(6,182,212,0.5)',
            }}/>

          {PIPELINE_STAGES.map((stage, i) => {
            const Icon = stage.icon
            const isDone    = i < activeIdx
            const isCurrent = i === activeIdx
            const isPending = i > activeIdx
            return (
              <div key={stage.id} className="flex flex-col items-center gap-2 z-10 flex-1">
                {/* node */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCurrent ? 'pulse-ring' : ''}`}
                  style={{
                    background: isDone ? `${stage.color}30` : isCurrent ? `${stage.color}25` : 'rgba(15,23,42,0.8)',
                    border: isDone ? `2px solid ${stage.color}` : isCurrent ? `2px solid ${stage.color}` : '2px solid rgba(71,85,105,0.4)',
                    boxShadow: isCurrent ? `0 0 20px ${stage.color}60` : isDone ? `0 0 8px ${stage.color}30` : 'none',
                  }}>
                  {isDone
                    ? <CheckCircle size={14} style={{ color:stage.color }}/>
                    : <Icon size={14} style={{ color: isCurrent ? stage.color : '#475569', opacity: isPending ? 0.5 : 1 }}/>
                  }
                </div>
                {/* label */}
                <div className="text-center hidden sm:block">
                  <p className="text-[9px] font-semibold leading-tight"
                    style={{ color: isDone||isCurrent ? stage.color : '#475569' }}>
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <p className="text-[8px] text-slate-600 mt-0.5">{o.stageProgress}%</p>
                  )}
                  {isDone && (
                    <p className="text-[8px]" style={{ color:`${stage.color}80` }}>Done</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dates footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-5 pt-3"
        style={{ borderTop:'1px solid rgba(59,130,246,0.08)' }}>
        <div className="flex items-center gap-2">
          <CalendarClock size={11} className="text-slate-500"/>
          <span className="text-[10px] text-slate-500">Started: <span className="text-slate-300 font-semibold">{startFmt}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={11} className="text-amber-400"/>
          <span className="text-[10px] text-slate-500">ETA: <span className="text-amber-300 font-semibold">{endFmt}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Timer size={11} className="text-cyan-400"/>
          <span className="text-[10px] text-slate-500">Remaining: <span className="text-cyan-300 font-semibold">{remaining}</span></span>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   SECTION 4 — ENHANCED WAFER MAP
═══════════════════════════════════════════════ */
const DIE_STATES = {
  good:        { fill:'rgba(37,99,235,0.55)',  stroke:'rgba(96,165,250,0.5)',   label:'Good' },
  defect_part: { fill:'rgba(245,158,11,0.55)', stroke:'rgba(251,191,36,0.5)',   label:'Partial Defect' },
  defect_full: { fill:'rgba(239,68,68,0.55)',  stroke:'rgba(248,113,113,0.5)',  label:'Full Defect' },
  edge_loss:   { fill:'rgba(139,92,246,0.35)', stroke:'rgba(167,139,250,0.4)', label:'Edge Loss' },
  empty:       { fill:'transparent',           stroke:'transparent',            label:'' },
}

function generateWaferDies(rows=9, cols=9, radius=3.8) {
  const dies = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c + 0.5 - cols/2
      const cy = r + 0.5 - rows/2
      const dist = Math.sqrt(cx*cx + cy*cy)
      if (dist > radius) { dies.push({ r,c,state:'empty' }); continue }
      if (dist > radius - 0.8) { dies.push({ r,c,state:'edge_loss' }); continue }
      const rnd = Math.random()
      const state = rnd < 0.78 ? 'good' : rnd < 0.91 ? 'defect_part' : 'defect_full'
      dies.push({ r,c,state })
    }
  }
  return dies
}

function EnhancedWaferMap() {
  const [dies] = useState(() => generateWaferDies())
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)

  const counts = dies.reduce((a, d) => {
    if (d.state !== 'empty') a[d.state] = (a[d.state]||0)+1
    return a
  }, {})
  const total      = (counts.good||0)+(counts.defect_part||0)+(counts.defect_full||0)+(counts.edge_loss||0)
  const goodCount  = counts.good||0
  const defectTotal= (counts.defect_part||0)+(counts.defect_full||0)
  const edgeLoss   = counts.edge_loss||0
  const yieldPct   = total > 0 ? ((goodCount/total)*100).toFixed(1) : '0.0'
  const defectPct  = total > 0 ? ((defectTotal/total)*100).toFixed(1) : '0.0'

  const ROWS=9, COLS=9, DW=18, DH=18, GAP=2
  const SVG_W = COLS*(DW+GAP)+GAP+20
  const SVG_H = ROWS*(DH+GAP)+GAP+20

  const activedie = hovered || selected

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'320ms' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background:'linear-gradient(90deg,transparent,#2563eb,#06b6d4,transparent)' }}/>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full" style={{ background:'linear-gradient(180deg,#2563eb,#06b6d4)' }}/>
          <h2 className="text-sm font-bold text-white">Wafer Health Map</h2>
        </div>
        <div className="flex gap-2">
          <span className="fab-badge badge-cyan">LOT #WL-448</span>
          <span className="fab-badge badge-green"><span className="live-dot w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>LIVE</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* SVG Wafer */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="relative">
            {/* Outer ring glow */}
            <div className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background:'radial-gradient(circle,rgba(37,99,235,0.12) 60%,transparent 80%)' }}/>
            <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display:'block' }}>
              <defs>
                <radialGradient id="wfBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#020817" stopOpacity="1"/>
                </radialGradient>
                <filter id="dieGlow">
                  <feGaussianBlur stdDeviation="0.8" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <clipPath id="waferClip">
                  <circle cx={SVG_W/2} cy={SVG_H/2} r={SVG_W/2-6}/>
                </clipPath>
              </defs>

              {/* Wafer base */}
              <circle cx={SVG_W/2} cy={SVG_H/2} r={SVG_W/2-4}
                fill="url(#wfBg)" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5"/>

              {/* Concentric rings */}
              {[0.85,0.65,0.45,0.25].map((rr,i) => (
                <circle key={i} cx={SVG_W/2} cy={SVG_H/2} r={(SVG_W/2-4)*rr}
                  fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
              ))}
              {/* Crosshair */}
              <line x1={SVG_W/2} y1={6} x2={SVG_W/2} y2={SVG_H-6} stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>
              <line x1={6} y1={SVG_H/2} x2={SVG_W-6} y2={SVG_H/2} stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>

              {/* Flat edge */}
              <line x1={SVG_W/2-40} y1={SVG_H-5} x2={SVG_W/2+40} y2={SVG_H-5}
                stroke="rgba(59,130,246,0.4)" strokeWidth="2"/>

              {/* Dies */}
              <g clipPath="url(#waferClip)">
                {dies.map((d, idx) => {
                  if (d.state === 'empty') return null
                  const cfg = DIE_STATES[d.state]
                  const x = GAP + d.c*(DW+GAP) + 10
                  const y = GAP + d.r*(DH+GAP) + 10
                  const isActive = activedie?.idx === idx
                  return (
                    <rect key={idx} x={x} y={y} width={DW} height={DH} rx={2}
                      fill={cfg.fill} stroke={isActive ? '#fff' : cfg.stroke}
                      strokeWidth={isActive ? 1.5 : 0.5}
                      filter={d.state!=='edge_loss' ? 'url(#dieGlow)' : undefined}
                      style={{ cursor:'pointer', transition:'all 0.15s', transform: isActive?`scale(1.15)`:'scale(1)', transformOrigin:`${x+DW/2}px ${y+DH/2}px` }}
                      onMouseEnter={() => setHovered({ idx, ...d, x, y })}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(s => s?.idx===idx ? null : { idx, ...d, x, y })}
                    />
                  )
                })}
              </g>

              {/* Center mark */}
              <circle cx={SVG_W/2} cy={SVG_H/2} r={3} fill="#60a5fa"
                style={{ filter:'drop-shadow(0 0 4px #60a5fa)' }}/>
              <line x1={SVG_W/2} y1={6} x2={SVG_W/2} y2={14} stroke="#60a5fa" strokeWidth="1.5"/>
            </svg>

            {/* Tooltip */}
            {activedie && activedie.state !== 'empty' && (
              <div className="absolute z-20 pointer-events-none text-[9px] px-2 py-1.5 rounded-lg whitespace-nowrap"
                style={{
                  background:'rgba(2,8,23,0.95)', border:`1px solid ${DIE_STATES[activedie.state].stroke}`,
                  top: activedie.y - 36, left: activedie.x - 10,
                  backdropFilter:'blur(8px)',
                }}>
                <p className="font-bold" style={{ color: activedie.state==='good'?'#4ade80':activedie.state==='edge_loss'?'#a78bfa':'#f87171' }}>
                  {DIE_STATES[activedie.state].label}
                </p>
                <p className="text-slate-400">R{activedie.r+1} · C{activedie.c+1}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats panel */}
        <div className="flex-1 flex flex-col justify-between gap-3">
          {/* Yield headline */}
          <div className="rounded-xl p-4 relative overflow-hidden"
            style={{ background:'rgba(37,99,235,0.08)', border:'1px solid rgba(37,99,235,0.2)' }}>
            <div className="flex items-end gap-3">
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Wafer Yield</p>
                <p className="text-3xl font-black text-glow-cyan" style={{ color:'#06b6d4' }}>{yieldPct}%</p>
              </div>
              <div className="pb-1">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Defect Rate</p>
                <p className="text-xl font-black text-red-400">{defectPct}%</p>
              </div>
            </div>
            {/* Yield bar */}
            <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
              <div className="h-full rounded-full" style={{ width:`${yieldPct}%`, background:'linear-gradient(90deg,#1d4ed8,#06b6d4)', boxShadow:'0 0 8px rgba(6,182,212,0.5)' }}/>
            </div>
          </div>

          {/* Die counts */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:'Good Dies',      count:goodCount,           color:'#4ade80', dot:'bg-blue-500' },
              { label:'Partial Defect', count:counts.defect_part||0, color:'#fbbf24', dot:'bg-amber-500' },
              { label:'Full Defect',    count:counts.defect_full||0, color:'#f87171', dot:'bg-red-500' },
              { label:'Edge Loss',      count:edgeLoss,            color:'#a78bfa', dot:'bg-purple-500' },
            ].map(s => (
              <div key={s.label} className="rounded-lg p-2.5" style={{ background:'rgba(15,23,42,0.6)', border:`1px solid ${s.color}18` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`}/>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider leading-tight">{s.label}</span>
                </div>
                <p className="text-sm font-black" style={{ color:s.color }}>{s.count}</p>
                <p className="text-[9px] text-slate-600">{total>0?((s.count/total)*100).toFixed(1):0}%</p>
              </div>
            ))}
          </div>

          {/* Health indicators */}
          <div className="rounded-xl p-3" style={{ background:'rgba(15,23,42,0.5)', border:'1px solid rgba(59,130,246,0.1)' }}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Health Indicators</p>
            <div className="space-y-2">
              {[
                { l:'Particle Density', v:72, c:'#10b981' },
                { l:'Edge Exclusion',   v:88, c:'#06b6d4' },
                { l:'Pattern Quality',  v:95, c:'#4ade80' },
              ].map(ind => (
                <div key={ind.l}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] text-slate-500">{ind.l}</span>
                    <span className="text-[9px] font-bold" style={{ color:ind.c }}>{ind.v}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(30,41,59,0.8)' }}>
                    <div className="h-full rounded-full" style={{ width:`${ind.v}%`, background:ind.c, boxShadow:`0 0 4px ${ind.c}60` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lot info */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { l:'Lot ID',       v:'WL-448-A' },
              { l:'Die Size',     v:'10×8 mm' },
              { l:'Total Dies',   v:String(total) },
              { l:'Technology',   v:'28nm' },
            ].map(s => (
              <div key={s.l} className="text-center p-2 rounded-lg" style={{ background:'rgba(15,23,42,0.5)', border:'1px solid rgba(59,130,246,0.06)' }}>
                <p className="text-[9px] text-slate-600 uppercase tracking-wider">{s.l}</p>
                <p className="text-[10px] font-bold text-slate-200 mt-0.5">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   SECTION 5 — CUSTOMER ORDERS
═══════════════════════════════════════════════ */
const CUSTOMER_ORDERS = [
  {
    id:'ORD-001', customer:'Samsung Semiconductor', logo:'SS',
    product:'5nm FinFET Logic',   qty:50000, unit:'dies',
    progress:78, priority:'CRITICAL', status:'In Fab',
    delivery:'2024-06-30', logoColor:'#1d4ed8',
    wafers:2500, completedWafers:1950,
    waferType:'5nm FinFET Silicon Wafer (300mm)',
    startDate:'2024-06-10', revenue:18200000,
    deliveryStatus:'On Track',
    notes:'Priority fabrication for Galaxy S series chipsets',
  },
  {
    id:'ORD-002', customer:'TSMC Alliance', logo:'TA',
    product:'14nm RF Chips', qty:120000, unit:'dies',
    progress:45, priority:'HIGH', status:'Lithography',
    delivery:'2024-07-08', logoColor:'#0891b2',
    wafers:6000, completedWafers:2700,
    waferType:'14nm FinFET Silicon Wafer (300mm)',
    startDate:'2024-06-15', revenue:14500000,
    deliveryStatus:'On Track',
    notes:'Bulk RF chip production for 5G modules',
  },
  {
    id:'ORD-003', customer:'Intel Foundry', logo:'IF',
    product:'28nm Power IC', qty:80000, unit:'dies',
    progress:92, priority:'HIGH', status:'Testing',
    delivery:'2024-06-24', logoColor:'#0ea5e9',
    wafers:4000, completedWafers:3680,
    waferType:'28nm CMOS Silicon Wafer (300mm)',
    startDate:'2024-06-01', revenue:10800000,
    deliveryStatus:'Due Today',
    notes:'Power management ICs for server platform',
  },
  {
    id:'ORD-004', customer:'Qualcomm Fab', logo:'QF',
    product:'7nm Mobile SoC', qty:200000, unit:'dies',
    progress:22, priority:'NORMAL', status:'Raw Wafer',
    delivery:'2024-07-20', logoColor:'#8b5cf6',
    wafers:10000, completedWafers:2200,
    waferType:'7nm EUV Silicon Wafer (300mm)',
    startDate:'2024-06-20', revenue:7400000,
    deliveryStatus:'On Track',
    notes:'Next-gen Snapdragon mobile processor',
  },
  {
    id:'ORD-005', customer:'NXP Technologies', logo:'NX',
    product:'180nm Automotive', qty:35000, unit:'dies',
    progress:99, priority:'NORMAL', status:'Packaging',
    delivery:'2024-06-22', logoColor:'#10b981',
    wafers:1750, completedWafers:1732,
    waferType:'180nm BCD Silicon Wafer (200mm)',
    startDate:'2024-05-28', revenue:3200000,
    deliveryStatus:'Near Complete',
    notes:'Automotive-grade MCUs for ADAS systems',
  },
  {
    id:'ORD-006', customer:'Infineon Systems', logo:'IS',
    product:'65nm Mixed Signal', qty:60000, unit:'dies',
    progress:0, priority:'NORMAL', status:'Queued',
    delivery:'2024-08-01', logoColor:'#f59e0b',
    wafers:3000, completedWafers:0,
    waferType:'65nm CMOS Silicon Wafer (300mm)',
    startDate:'2024-07-05', revenue:1900000,
    deliveryStatus:'Scheduled',
    notes:'Mixed-signal ICs for industrial IoT edge nodes',
  },
]

const priorityCfg = {
  CRITICAL: { cls:'badge-red',   color:'#f87171' },
  HIGH:     { cls:'badge-amber', color:'#fbbf24' },
  NORMAL:   { cls:'badge-blue',  color:'#60a5fa' },
}

const statusCfg = {
  'In Fab':      { color:'#06b6d4', dot:'bg-cyan-400' },
  'Lithography': { color:'#a78bfa', dot:'bg-purple-400' },
  'Testing':     { color:'#4ade80', dot:'bg-green-400' },
  'Raw Wafer':   { color:'#64748b', dot:'bg-slate-400' },
  'Packaging':   { color:'#fb923c', dot:'bg-orange-400' },
  'Queued':      { color:'#475569', dot:'bg-slate-500' },
}

function fmtINR(val) {
  if (val >= 10000000) return `₹${(val/10000000).toFixed(2)}Cr`
  if (val >= 100000)   return `₹${(val/100000).toFixed(1)}L`
  return `₹${val.toLocaleString('en-IN')}`
}

/* ── Customer Detail Modal ── */
function CustomerDetailModal({ order, onClose }) {
  if (!order) return null
  const pCfg = priorityCfg[order.priority]
  const sCfg = statusCfg[order.status] || { color:'#60a5fa', dot:'bg-blue-400' }
  const isOverdue = new Date(order.delivery) < new Date() && order.progress < 100
  const mfgCost = Math.round(order.revenue * 0.72)
  const STAGES = ['Raw Wafer','Lithography','In Fab','Testing','Packaging','Completed']
  const activeIdx = Math.max(0, STAGES.indexOf(order.status))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl glass"
        style={{ border:'1px solid rgba(59,130,246,0.3)' }}
        onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background:'linear-gradient(90deg,transparent,#8b5cf6,#06b6d4,transparent)' }}/>
        <div className="flex items-start justify-between p-5 pb-4"
          style={{ borderBottom:'1px solid rgba(59,130,246,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
              style={{ background:`${order.logoColor}30`, border:`1px solid ${order.logoColor}60` }}>{order.logo}</div>
            <div>
              <h2 className="text-base font-black text-white">{order.customer}</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">{order.id} · {order.product}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0 text-xl font-light">
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`fab-badge ${pCfg.cls}`}>{order.priority} PRIORITY</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={{ background:`${sCfg.color}15`, border:`1px solid ${sCfg.color}30`, color:sCfg.color }}>
              <span className={`w-1.5 h-1.5 rounded-full ${order.status!=='Queued'?'live-dot':''} ${sCfg.dot}`}/>
              {order.status}
            </div>
            {isOverdue && <span className="fab-badge badge-red">OVERDUE</span>}
            <span className="fab-badge badge-cyan">{order.deliveryStatus}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l:'Order Qty', v:order.qty.toLocaleString('en-IN'), u:order.unit, c:'#60a5fa' },
              { l:'Wafers', v:order.wafers.toLocaleString('en-IN'), u:'total', c:'#22d3ee' },
              { l:'Completed', v:order.completedWafers.toLocaleString('en-IN'), u:'wafers', c:'#4ade80' },
              { l:'Revenue', v:fmtINR(order.revenue), u:'', c:'#fbbf24' },
            ].map(s => (
              <div key={s.l} className="rounded-xl p-3 text-center" style={{ background:`${s.c}08`, border:`1px solid ${s.c}20` }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">{s.l}</p>
                <p className="text-sm font-black mt-1" style={{ color:s.c }}>{s.v}</p>
                {s.u && <p className="text-[9px] text-slate-600">{s.u}</p>}
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Overall Progress</span>
              <span className="text-lg font-black text-cyan-300">{order.progress}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background:'rgba(15,23,42,0.8)' }}>
              <div className="h-full rounded-full" style={{ width:`${order.progress}%`, background:'linear-gradient(90deg,#1d4ed8,#06b6d4)', boxShadow:'0 0 8px rgba(6,182,212,0.5)' }}/>
            </div>
            <div className="flex items-center justify-between gap-1">
              {STAGES.map((stage, i) => {
                const isDone = i < activeIdx, isCurrent = i === activeIdx
                const c = isDone ? '#4ade80' : isCurrent ? '#06b6d4' : '#334155'
                return (
                  <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black"
                      style={{ background:`${c}20`, border:`1px solid ${c}60`, color:c }}>{isDone?'✓':i+1}</div>
                    <span className="text-[7px] text-center leading-tight hidden sm:block" style={{ color:c }}>{stage.split(' ')[0]}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Order Details</p>
              {[
                ['Wafer Type', order.waferType||'—'],
                ['Start Date', new Date(order.startDate||order.delivery).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})],
                ['Est. Completion', new Date(order.delivery).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})],
                ['Delivery Status', order.deliveryStatus||'—'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between items-start gap-2 py-1.5" style={{ borderBottom:'1px solid rgba(59,130,246,0.06)' }}>
                  <span className="text-[10px] text-slate-500">{k}</span>
                  <span className="text-[10px] font-semibold text-slate-200 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-4" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Financials</p>
              {[
                ['Total Revenue', fmtINR(order.revenue||0)],
                ['Mfg Cost (Est)', fmtINR(mfgCost)],
                ['Profit (Est)', fmtINR((order.revenue||0) - mfgCost)],
                ['Profit Margin', '28%'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between items-start gap-2 py-1.5" style={{ borderBottom:'1px solid rgba(59,130,246,0.06)' }}>
                  <span className="text-[10px] text-slate-500">{k}</span>
                  <span className="text-[10px] font-bold text-green-300 text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
          {order.notes && (
            <div className="rounded-xl p-3" style={{ background:'rgba(37,99,235,0.08)', border:'1px solid rgba(59,130,246,0.15)' }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Notes</p>
              <p className="text-[11px] text-slate-300">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CustomerOrders() {
  const [sortBy, setSortBy] = useState('priority')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const statuses = ['All', ...new Set(CUSTOMER_ORDERS.map(o => o.status))]

  const filtered = CUSTOMER_ORDERS
    .filter(o => filterStatus === 'All' || o.status === filterStatus)
    .sort((a,b) => {
      if (sortBy==='priority') {
        const order = {CRITICAL:0,HIGH:1,NORMAL:2}
        return order[a.priority]-order[b.priority]
      }
      if (sortBy==='progress') return b.progress - a.progress
      if (sortBy==='delivery') return new Date(a.delivery)-new Date(b.delivery)
      return 0
    })

  const totalWafers    = CUSTOMER_ORDERS.reduce((s,o) => s+o.wafers, 0)
  const completedWafers= CUSTOMER_ORDERS.reduce((s,o) => s+o.completedWafers, 0)
  const criticalCount  = CUSTOMER_ORDERS.filter(o=>o.priority==='CRITICAL').length
  const dueToday       = CUSTOMER_ORDERS.filter(o=>new Date(o.delivery).toDateString()===new Date().toDateString()).length

  return (
    <>
    {selectedOrder && <CustomerDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)}/>}
    <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'360ms' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background:'linear-gradient(90deg,transparent,#8b5cf6,#10b981,transparent)' }}/>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full" style={{ background:'linear-gradient(180deg,#8b5cf6,#10b981)' }}/>
          <div>
            <h2 className="text-sm font-bold text-white">Customer Orders</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Click any customer to view order details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="fab-badge badge-red"><AlertCircle size={8}/>{criticalCount} CRITICAL</span>
          <span className="fab-badge badge-amber">{CUSTOMER_ORDERS.filter(o=>o.status!=='Queued').length} ACTIVE</span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { l:'Total Orders',       v:String(CUSTOMER_ORDERS.length), c:'#60a5fa' },
          { l:'Wafers In Progress', v:`${(completedWafers/1000).toFixed(1)}k / ${(totalWafers/1000).toFixed(0)}k`, c:'#06b6d4' },
          { l:'Critical Priority',  v:String(criticalCount),          c:'#f87171' },
          { l:'Due Today',          v:String(dueToday),               c:'#fbbf24' },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-3 text-center" style={{ background:'rgba(15,23,42,0.6)', border:`1px solid ${s.c}15` }}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{s.l}</p>
            <p className="text-sm font-black mt-0.5" style={{ color:s.c }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all duration-150"
              style={{
                background: filterStatus===s ? 'rgba(37,99,235,0.25)' : 'rgba(15,23,42,0.6)',
                border: `1px solid ${filterStatus===s ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.1)'}`,
                color: filterStatus===s ? '#93c5fd' : '#475569',
              }}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-slate-600 uppercase tracking-wider">Sort:</span>
          {[['priority','Priority'],['progress','Progress'],['delivery','Delivery']].map(([k,l]) => (
            <button key={k} onClick={() => setSortBy(k)}
              className="text-[9px] font-bold px-2 py-0.5 rounded transition-all"
              style={{
                color: sortBy===k ? '#06b6d4' : '#475569',
                borderBottom: sortBy===k ? '1px solid #06b6d4' : '1px solid transparent',
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table / cards */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5">
        {filtered.map((order, i) => {
          const pCfg = priorityCfg[order.priority]
          const sCfg = statusCfg[order.status] || { color:'#60a5fa', dot:'bg-blue-400' }
          const delDate = new Date(order.delivery)
          const isOverdue = delDate < new Date() && order.progress < 100
          const isDueToday = delDate.toDateString()===new Date().toDateString()
          return (
            <div key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="rounded-xl p-4 relative overflow-hidden group transition-all duration-200 hover:brightness-110 cursor-pointer"
              style={{
                background: i%2===0 ? 'rgba(15,23,42,0.7)' : 'rgba(8,14,31,0.7)',
                border:`1px solid rgba(59,130,246,0.08)`,
                animationDelay:`${i*50}ms`,
              }}>
              {/* Priority accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background:pCfg.color }}/>
              {/* Click hint */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] text-slate-600 flex items-center gap-0.5"><ChevronRight size={9}/>view</span>
              </div>

              <div className="flex flex-wrap items-start gap-3 pl-3">
                {/* Logo */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                  style={{ background:`${order.logoColor}30`, border:`1px solid ${order.logoColor}50` }}>
                  {order.logo}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{order.customer}</span>
                    <span className={`fab-badge ${pCfg.cls}`}>{order.priority}</span>
                    {isOverdue && <span className="fab-badge badge-red">OVERDUE</span>}
                    {isDueToday && !isOverdue && <span className="fab-badge badge-amber">DUE TODAY</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] text-slate-400">{order.product}</span>
                    <span className="text-[9px] text-slate-600">·</span>
                    <span className="text-[9px] text-slate-500">{order.id}</span>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width:`${order.progress}%`,
                          background: order.progress>=90 ? 'linear-gradient(90deg,#10b981,#4ade80)' :
                                      order.progress>=50 ? 'linear-gradient(90deg,#1d4ed8,#06b6d4)' :
                                                           'linear-gradient(90deg,#7c3aed,#a78bfa)',
                          boxShadow: order.progress>=90 ? '0 0 6px rgba(16,185,129,0.5)' : '0 0 6px rgba(37,99,235,0.4)',
                        }}/>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 w-7 text-right">{order.progress}%</span>
                  </div>
                </div>

                {/* Right side stats */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold`}
                    style={{ background:`${sCfg.color}15`, border:`1px solid ${sCfg.color}30`, color:sCfg.color }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${order.status!=='Queued'?'live-dot':''} ${sCfg.dot}`}/>
                    {order.status}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-600">Wafers</p>
                    <p className="text-[10px] font-bold text-slate-300">
                      {order.completedWafers.toLocaleString('en-IN')}/{order.wafers.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck size={9} style={{ color: isOverdue?'#f87171':isDueToday?'#fbbf24':'#475569' }}/>
                    <span className="text-[9px]" style={{ color: isOverdue?'#f87171':isDueToday?'#fbbf24':'#475569' }}>
                      {delDate.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop:'1px solid rgba(59,130,246,0.08)' }}>
        <span className="text-[10px] text-slate-600">
          Showing {filtered.length} of {CUSTOMER_ORDERS.length} orders
        </span>
        <button className="flex items-center gap-1 text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          View All Orders <ChevronRight size={11}/>
        </button>
      </div>
    </div>
    </>
  )
}

/* ════════════════════════════════════════════════
   SECTION 6 — STAGE PROGRESS BARS (bottom strip)
═══════════════════════════════════════════════ */
const STAGE_BARS = [
  { name:'Lithography', pct:95, color:'#06b6d4' },
  { name:'Etching',     pct:88, color:'#f59e0b' },
  { name:'Deposition',  pct:92, color:'#10b981' },
  { name:'Packaging',   pct:80, color:'#f59e0b' },
]

/* ════════════════════════════════════════════════
   MAIN PAGE EXPORT
═══════════════════════════════════════════════ */
export default function Dashboard() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            <span className="gradient-text-cyan">Operations</span> Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Radio size={10} className="text-green-400 live-dot"/>
            Real-time fab performance · Auto-refresh every 30s
          </p>
        </div>
        <div className="fab-badge badge-cyan"><Zap size={9}/>SHIFT A ACTIVE</div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiConfig.map((k,i) => <KpiCard key={k.label} {...k} delay={i*80}/>)}
      </div>

      {/* ── Production chart + Wafer Map (side by side) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Production Trend */}
        <div className="xl:col-span-3 glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'200ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 shimmer-line opacity-50"/>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white">Weekly Production Trend</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Wafers produced Mon – Fri</p>
            </div>
            <span className="fab-badge badge-blue">THIS WEEK</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={productionTrend} margin={{ top:5, right:10, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false}/>
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#475569' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:'#475569' }} axisLine={false} tickLine={false}
                tickFormatter={v=>`${(v/1000).toFixed(0)}k`} domain={[9000,13500]}/>
              <Tooltip content={<FabTooltip/>}/>
              <Area type="monotone" dataKey="wafers" stroke="#2563eb" strokeWidth={2.5}
                fill="url(#wg)" dot={{ fill:'#2563eb', r:4, strokeWidth:2, stroke:'#93c5fd' }}
                activeDot={{ r:6, fill:'#60a5fa' }}/>
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop:'1px solid rgba(59,130,246,0.1)' }}>
            {[
              { l:'Peak Day',    v:'Friday',  s:'12,500 wafers' },
              { l:'Weekly Total',v:'56,000',  s:'wafers produced' },
              { l:'WoW Growth',  v:'+25%',    s:'vs prior week' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{s.l}</p>
                <p className="text-sm font-bold text-cyan-300 mt-0.5">{s.v}</p>
                <p className="text-[10px] text-slate-600">{s.s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Status (right panel) */}
        <div className="xl:col-span-2 glass rounded-2xl p-5 anim-fade-up" style={{ animationDelay:'260ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Process Stage Status</h2>
            <span className="fab-badge badge-green">LIVE</span>
          </div>
          <div className="space-y-4">
            {STAGE_BARS.map((s,i) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-400">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color:s.color }}>{s.pct}%</span>
                    <span className={`fab-badge ${s.pct>=90?'badge-green':s.pct>=80?'badge-amber':'badge-red'}`}>
                      {s.pct>=90?'ON TRACK':s.pct>=80?'CAUTION':'BEHIND'}
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(30,41,59,0.8)' }}>
                  <div className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: animated?`${s.pct}%`:'0%',
                      background:`linear-gradient(90deg,${s.color}aa,${s.color})`,
                      boxShadow:`0 0 8px ${s.color}80`,
                      transitionDelay:`${i*150}ms`,
                    }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4" style={{ borderTop:'1px solid rgba(59,130,246,0.1)' }}>
            {[
              { l:'Throughput', v:'2,500/day', c:'#06b6d4' },
              { l:'Cycle Time', v:'18.5 hrs',  c:'#8b5cf6' },
              { l:'On-Time',    v:'97.3%',      c:'#10b981' },
            ].map(s => (
              <div key={s.l} className="text-center p-2 rounded-xl" style={{ background:'rgba(15,23,42,0.5)', border:'1px solid rgba(59,130,246,0.08)' }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">{s.l}</p>
                <p className="text-xs font-bold mt-1" style={{ color:s.c }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live Production Tracker (full width) ── */}
      <LiveProductionTracker/>

      {/* ── Wafer Map + Customer Orders ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-2">
          <EnhancedWaferMap/>
        </div>
        <div className="xl:col-span-3">
          <CustomerOrders/>
        </div>
      </div>
    </div>
  )
}
