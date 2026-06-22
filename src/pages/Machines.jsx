import React, { useState, useEffect, useCallback } from 'react'
import {
  Thermometer, Gauge, Clock, Activity, Cpu,
  RefreshCw, Zap, Radio,
} from 'lucide-react'
import { machinesData } from '../data/mockData'

const STATUSES = ['Running','Running','Running','Running','Idle','Maintenance']

function rnd(min, max, dec=0) {
  const v = Math.random() * (max - min) + min
  return dec > 0 ? parseFloat(v.toFixed(dec)) : Math.round(v)
}

function initState() {
  return machinesData.reduce((a, m) => {
    a[m.id] = { temperature: rnd(60,90), pressure: rnd(1.0,2.5,1), status: STATUSES[Math.floor(Math.random()*STATUSES.length)] }
    return a
  }, {})
}

const statusCfg = {
  Running:     { color:'#4ade80', bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.35)',  label:'RUNNING',     dot:'bg-green-400' },
  Idle:        { color:'#fbbf24', bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.35)', label:'IDLE',        dot:'bg-amber-400' },
  Maintenance: { color:'#f87171', bg:'rgba(248,113,113,0.12)',border:'rgba(248,113,113,0.35)',label:'MAINTENANCE', dot:'bg-red-400' },
}

/* ── Circular arc gauge ───────────────────────── */
function ArcGauge({ value, min, max, color, label, unit, size=56 }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const r = (size / 2) - 5
  const circ = Math.PI * r
  const offset = circ - pct * circ
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size/2+8}`} style={{ overflow:'visible' }}>
        <path d={`M 5 ${size/2} A ${r} ${r} 0 0 1 ${size-5} ${size/2}`}
          fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth="6" strokeLinecap="round" />
        <path d={`M 5 ${size/2} A ${r} ${r} 0 0 1 ${size-5} ${size/2}`}
          fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:'stroke-dashoffset 0.8s ease', filter:`drop-shadow(0 0 4px ${color})` }} />
        <text x={size/2} y={size/2+2} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
          {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
        </text>
      </svg>
      <p className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">{label} <span className="text-slate-500">{unit}</span></p>
    </div>
  )
}

/* ── Machine card ─────────────────────────────── */
function MachineCard({ machine, live }) {
  const cfg = statusCfg[live.status] || statusCfg.Idle
  const tempPct = (live.temperature - 60) / 30
  const tempColor = live.temperature > 82 ? '#f87171' : live.temperature > 72 ? '#fbbf24' : '#4ade80'

  return (
    <div className="relative glass rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 anim-fade-up"
      style={{ border:`1px solid ${cfg.border}20` }}>
      {/* Status glow */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background:`linear-gradient(90deg,transparent,${cfg.color},transparent)` }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
            style={{ background:'rgba(2,8,23,0.9)', border:`1px solid ${cfg.color}40` }}>
            <Cpu size={18} style={{ color:cfg.color }} />
            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-900 live-dot ${cfg.dot}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{machine.name}</p>
            <p className="text-[10px] text-slate-500">{machine.type}</p>
          </div>
        </div>
        <span className="fab-badge" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
          {cfg.label}
        </span>
      </div>

      {/* Gauges */}
      <div className="flex items-end justify-around mb-4 py-2">
        <ArcGauge value={live.temperature} min={60} max={90} color={tempColor} label="TEMP" unit="°C" size={64} />
        <ArcGauge value={live.pressure} min={1.0} max={2.5} color="#60a5fa" label="PRESS" unit="bar" size={64} />
      </div>

      {/* Temp bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-[9px] text-slate-600 uppercase tracking-wider">Thermal Load</span>
          <span className="text-[9px] font-bold" style={{ color:tempColor }}>{Math.round(tempPct*100)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width:`${tempPct*100}%`, background:`linear-gradient(90deg,${tempColor}80,${tempColor})`,
              boxShadow:`0 0 8px ${tempColor}60` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3"
        style={{ borderTop:'1px solid rgba(59,130,246,0.08)' }}>
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-slate-600" />
          <span className="text-[10px] text-slate-500">Runtime: <span className="text-slate-300 font-bold">{machine.runtime} hrs</span></span>
        </div>
        <span className="text-[10px] text-slate-600">{machine.location}</span>
      </div>
    </div>
  )
}

/* ── Fab floor map ────────────────────────────── */
function FabFloorMap({ machines, liveData }) {
  const zones = [
    { id:'Bay1', label:'Bay 1', x:10,  y:10,  w:38, h:35, machines:['A12'] },
    { id:'Bay2', label:'Bay 2', x:55,  y:10,  w:38, h:35, machines:['B07','E11'] },
    { id:'Bay3', label:'Bay 3', x:10,  y:55,  w:38, h:35, machines:['C19'] },
    { id:'Bay4', label:'Bay 4', x:55,  y:55,  w:38, h:35, machines:['D25'] },
    { id:'Bay5', label:'Bay 5', x:100, y:32,  w:38, h:35, machines:['F03'] },
  ]

  const statusColor = { Running:'#4ade80', Idle:'#fbbf24', Maintenance:'#f87171' }

  return (
    <svg viewBox="0 0 148 100" className="w-full" style={{ maxHeight:200 }}>
      <defs>
        <filter id="mapGlow">
          <feGaussianBlur stdDeviation="1" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Background */}
      <rect width="148" height="100" fill="rgba(2,8,23,0.5)" rx="4" />

      {/* Grid */}
      {Array.from({length:7},(_,i)=><line key={`h${i}`} x1="0" y1={i*17} x2="148" y2={i*17} stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>)}
      {Array.from({length:9},(_,i)=><line key={`v${i}`} x1={i*19} y1="0" x2={i*19} y2="100" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>)}

      {zones.map(z => {
        const mIds = z.machines
        return (
          <g key={z.id}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="3"
              fill="rgba(15,23,42,0.7)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.8" />
            <text x={z.x+z.w/2} y={z.y+8} textAnchor="middle" fontSize="4" fill="#475569" fontWeight="600">
              {z.label}
            </text>
            {mIds.map((mid, mi) => {
              const st = liveData[mid]?.status || 'Idle'
              const col = statusColor[st]
              const mx = z.x + 8 + mi * 16
              const my = z.y + 16
              return (
                <g key={mid}>
                  <rect x={mx} y={my} width={11} height={11} rx="2"
                    fill={`${col}25`} stroke={col} strokeWidth="0.8" filter="url(#mapGlow)" />
                  <text x={mx+5.5} y={my+7} textAnchor="middle" fontSize="3.5" fill={col} fontWeight="700">{mid}</text>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Legend */}
      {[['#4ade80','Run'],['#fbbf24','Idle'],['#f87171','Maint']].map(([c,l],i) => (
        <g key={l}>
          <rect x={4+i*32} y={92} width={6} height={4} rx="1" fill={c} opacity="0.8" />
          <text x={12+i*32} y={95.5} fontSize="3.5" fill="#64748b">{l}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Machines() {
  const [liveData, setLiveData] = useState(initState)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => {
    setLiveData(() => initState())
    setLastUpdated(new Date())
    setTick(t => t + 1)
  }, [])

  useEffect(() => {
    const iv = setInterval(refresh, 2000)
    return () => clearInterval(iv)
  }, [refresh])

  const machines = machinesData.map(m => ({ ...m, ...liveData[m.id] }))
  const counts = machines.reduce((a,m) => { a[m.status] = (a[m.status]||0)+1; return a }, {})
  const avgTemp = Math.round(machines.reduce((s,m) => s + (liveData[m.id]?.temperature||70), 0) / machines.length)
  const avgPres = (machines.reduce((s,m) => s + (liveData[m.id]?.pressure||1.5), 0) / machines.length).toFixed(1)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            <span className="gradient-text-cyan">Machine</span> Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Radio size={10} className="text-green-400 live-dot" />
            Live telemetry — updates every 2 seconds · tick #{tick}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="fab-badge badge-green"><span className="live-dot w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> LIVE</span>
          <button onClick={refresh}
            className="btn-fab-secondary py-1.5 px-3 text-[11px]">
            <RefreshCw size={11} />Refresh
          </button>
        </div>
      </div>

      {/* Fleet summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { l:'Running',     v:counts.Running||0,     c:'#4ade80' },
          { l:'Idle',        v:counts.Idle||0,        c:'#fbbf24' },
          { l:'Maintenance', v:counts.Maintenance||0, c:'#f87171' },
          { l:'Avg Temp',    v:`${avgTemp}°C`,         c:'#fb923c' },
          { l:'Avg Pressure',v:`${avgPres} bar`,       c:'#60a5fa' },
          { l:'Fleet Uptime',v:'96.8%',               c:'#4ade80' },
        ].map((s,i) => (
          <div key={s.l} className="glass rounded-xl p-3 text-center anim-fade-up" style={{ animationDelay:`${i*60}ms` }}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{s.l}</p>
            <p className="text-lg font-black mt-0.5" style={{ color:s.c }}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Fab floor map */}
        <div className="xl:col-span-1 glass rounded-2xl p-5 anim-fade-up" style={{ animationDelay:'120ms' }}>
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Zap size={14} className="text-cyan-400" />Fab Floor Map
          </h2>
          <FabFloorMap machines={machinesData} liveData={liveData} />
          <p className="text-[9px] text-slate-600 text-center mt-2">
            Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })}
          </p>
        </div>

        {/* Machine cards */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((m, i) => (
            <div key={m.id} style={{ animationDelay:`${i*60}ms` }}>
              <MachineCard machine={m} live={liveData[m.id] || { temperature:70, pressure:1.5, status:'Idle' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
