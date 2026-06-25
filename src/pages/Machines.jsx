import React, { useState, useEffect, useCallback } from 'react'
import { Thermometer, Gauge, Clock, Activity, Cpu, RefreshCw, Zap, Radio } from 'lucide-react'
import { machinesData } from '../data/mockData'
import PageHero from '../components/PageHero'
const HERO_IMG = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=80&fit=crop'

const STATUSES = ['Running','Running','Running','Running','Idle','Maintenance']
function rnd(min, max, dec=0) {
  const v = Math.random()*(max-min)+min
  return dec > 0 ? parseFloat(v.toFixed(dec)) : Math.round(v)
}
function initState() {
  return machinesData.reduce((a,m) => {
    a[m.id] = { temperature:rnd(60,90), pressure:rnd(1.0,2.5,1), status:STATUSES[Math.floor(Math.random()*STATUSES.length)] }
    return a
  }, {})
}

const statusCfg = {
  Running:     { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', label:'Running',     dot:'bg-green-500' },
  Idle:        { color:'#d97706', bg:'#fffbeb', border:'#fde68a', label:'Idle',        dot:'bg-amber-500' },
  Maintenance: { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', label:'Maintenance', dot:'bg-red-500'   },
}

function ArcGauge({ value, min, max, color, label, unit, size=64 }) {
  const pct = Math.max(0, Math.min(1, (value-min)/(max-min)))
  const r = size/2 - 5
  const circ = Math.PI * r
  const offset = circ - pct*circ
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size/2+10} viewBox={`0 0 ${size} ${size/2+10}`} style={{ overflow:'visible' }}>
        <path d={`M 5 ${size/2} A ${r} ${r} 0 0 1 ${size-5} ${size/2}`}
          fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round"/>
        <path d={`M 5 ${size/2} A ${r} ${r} 0 0 1 ${size-5} ${size/2}`}
          fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:'stroke-dashoffset 0.8s ease' }}/>
        <text x={size/2} y={size/2+2} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
          {typeof value==='number' && !Number.isInteger(value) ? value.toFixed(1) : value}
        </text>
      </svg>
      <p className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5">{label} <span className="text-slate-400">{unit}</span></p>
    </div>
  )
}

function MachineCard({ machine, live }) {
  const cfg = statusCfg[live.status] || statusCfg.Idle
  const tempPct = (live.temperature-60)/30
  const tempColor = live.temperature>82 ? '#dc2626' : live.temperature>72 ? '#d97706' : '#16a34a'

  return (
    <div className="card card-lift p-5 overflow-hidden relative anim-fade-up"
      style={{ borderTop:`3px solid ${cfg.color}` }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-box rounded-xl" style={{ background:cfg.bg, color:cfg.color }}>
            <Cpu size={18}/>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{machine.name}</p>
            <p className="text-[10px] text-slate-500">{machine.type}</p>
          </div>
        </div>
        <span className="badge" style={{ background:cfg.bg, color:cfg.color, borderColor:cfg.border }}>
          <span className={`w-1.5 h-1.5 rounded-full live-dot inline-block mr-1 ${cfg.dot}`}/>
          {cfg.label}
        </span>
      </div>

      {/* Gauges */}
      <div className="flex items-end justify-around mb-4 py-2 bg-slate-50 rounded-xl">
        <ArcGauge value={live.temperature} min={60} max={90} color={tempColor} label="TEMP" unit="°C" size={64}/>
        <ArcGauge value={live.pressure} min={1.0} max={2.5} color="#2563eb" label="PRESS" unit="bar" size={64}/>
      </div>

      {/* Thermal bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">Thermal Load</span>
          <span className="text-[9px] font-bold" style={{ color:tempColor }}>{Math.round(tempPct*100)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width:`${tempPct*100}%`, background:tempColor }}/>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-slate-400"/>
          <span className="text-[10px] text-slate-500">Runtime: <span className="font-semibold text-slate-700">{machine.runtime} hrs</span></span>
        </div>
        <span className="text-[10px] text-slate-400">{machine.location}</span>
      </div>
    </div>
  )
}

function FabFloorMap({ machines, liveData }) {
  const zones = [
    { id:'Bay1', label:'Bay 1', x:10, y:10, w:38, h:35, machines:['A12'] },
    { id:'Bay2', label:'Bay 2', x:55, y:10, w:38, h:35, machines:['B07','E11'] },
    { id:'Bay3', label:'Bay 3', x:10, y:55, w:38, h:35, machines:['C19'] },
    { id:'Bay4', label:'Bay 4', x:55, y:55, w:38, h:35, machines:['D25'] },
    { id:'Bay5', label:'Bay 5', x:100, y:32, w:38, h:35, machines:['F03'] },
  ]
  const statusColor = { Running:'#16a34a', Idle:'#d97706', Maintenance:'#dc2626' }

  return (
    <svg viewBox="0 0 148 100" className="w-full" style={{ maxHeight:200 }}>
      <rect width="148" height="100" fill="#f8fafc" rx="6"/>
      {Array.from({length:7},(_,i)=><line key={`h${i}`} x1="0" y1={i*17} x2="148" y2={i*17} stroke="#e2e8f0" strokeWidth="0.5"/>)}
      {Array.from({length:9},(_,i)=><line key={`v${i}`} x1={i*19} y1="0" x2={i*19} y2="100" stroke="#e2e8f0" strokeWidth="0.5"/>)}
      {zones.map(z => (
        <g key={z.id}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
          <text x={z.x+z.w/2} y={z.y+8} textAnchor="middle" fontSize="4" fill="#94a3b8" fontWeight="600">{z.label}</text>
          {z.machines.map((mid, mi) => {
            const st = liveData[mid]?.status||'Idle'
            const col = statusColor[st]
            const mx = z.x+8+mi*16, my = z.y+16
            return (
              <g key={mid}>
                <rect x={mx} y={my} width={11} height={11} rx="2" fill={`${col}20`} stroke={col} strokeWidth="0.8"/>
                <text x={mx+5.5} y={my+7} textAnchor="middle" fontSize="3.5" fill={col} fontWeight="700">{mid}</text>
              </g>
            )
          })}
        </g>
      ))}
      {[['#16a34a','Running'],['#d97706','Idle'],['#dc2626','Maint']].map(([c,l],i) => (
        <g key={l}>
          <rect x={4+i*32} y={92} width={6} height={4} rx="1" fill={c} opacity="0.8"/>
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
    setLiveData(initState())
    setLastUpdated(new Date())
    setTick(t => t+1)
  }, [])

  useEffect(() => { const iv = setInterval(refresh, 2000); return () => clearInterval(iv) }, [refresh])

  const machines = machinesData.map(m => ({ ...m, ...liveData[m.id] }))
  const counts = machines.reduce((a,m) => { a[m.status]=(a[m.status]||0)+1; return a }, {})
  const avgTemp = Math.round(machines.reduce((s,m) => s+(liveData[m.id]?.temperature||70),0)/machines.length)
  const avgPres = (machines.reduce((s,m) => s+(liveData[m.id]?.pressure||1.5),0)/machines.length).toFixed(1)

  return (
    <div>
      <PageHero src={HERO_IMG} badge="Live Telemetry · Updates every 2s" title="Machine Monitoring" accent="48 Fab Machines" sub="Real-time machine health — thermal load, pressure gauges, and maintenance tracking." />

      {/* ── Fleet stats — purple tint ── */}
      <div style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', padding:'24px 0' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-2">
          {[
            { l:'Running',      v:counts.Running||0,      c:'#16a34a', bg:'#f0fdf4' },
            { l:'Idle',         v:counts.Idle||0,         c:'#d97706', bg:'#fffbeb' },
            { l:'Maintenance',  v:counts.Maintenance||0,  c:'#dc2626', bg:'#fef2f2' },
            { l:'Avg Temp',     v:`${avgTemp}°C`,          c:'#d97706', bg:'#fffbeb' },
            { l:'Avg Pressure', v:`${avgPres} bar`,        c:'#2563eb', bg:'#eff6ff' },
            { l:'Fleet Uptime', v:'96.8%',                c:'#16a34a', bg:'#f0fdf4' },
          ].map((s,i) => (
            <div key={s.l} className="stat-card text-center anim-fade-up" style={{ animationDelay:`${i*60}ms` }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">{s.l}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color:s.c }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Floor map + machine cards — white ── */}
      <div style={{ background:'#fff', padding:'28px 0' }}>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 px-2">
          <div className="xl:col-span-1 card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Zap size={14} className="text-blue-600"/>Fab Floor Map
            </h2>
            <FabFloorMap machines={machinesData} liveData={liveData}/>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <p className="text-[9px] text-slate-400">Updated: {lastUpdated.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})}</p>
              <button onClick={refresh} className="btn-ghost text-[11px] py-1 px-2.5 flex items-center gap-1.5">
                <RefreshCw size={11}/>Refresh
              </button>
            </div>
          </div>
          <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map((m,i) => (
              <div key={m.id} style={{ animationDelay:`${i*60}ms` }}>
                <MachineCard machine={m} live={liveData[m.id]||{temperature:70,pressure:1.5,status:'Idle'}}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Image banner ── */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:180, display:'flex', alignItems:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url('${HERO_IMG}')`, backgroundSize:'cover', backgroundPosition:'center', zIndex:0 }}/>
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(90deg,rgba(5,10,30,0.90) 0%,rgba(5,10,30,0.60) 60%,rgba(5,10,30,0.15) 100%)' }}/>
        <div style={{ position:'relative', zIndex:2, padding:'28px 40px' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#c4b5fd', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>Machine Intelligence</p>
          <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(1.3rem,2.2vw,1.8rem)', fontWeight:800, color:'#fff', marginBottom:6 }}>
            Live Thermal. Live Pressure.<br/><span style={{ color:'#a5f3fc' }}>Zero Downtime Surprises.</span>
          </h3>
          <p style={{ fontSize:'0.82rem', color:'rgba(203,213,225,0.85)', maxWidth:460 }}>Every machine updated every 2 seconds — temperature, pressure, status and thermal load, all tracked automatically.</p>
        </div>
      </div>
    </div>
  )
}
