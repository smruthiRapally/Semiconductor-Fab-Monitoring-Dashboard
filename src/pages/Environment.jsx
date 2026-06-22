import React, { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  Thermometer, Droplets, Shield, Wind, Atom, Activity,
  CheckCircle, AlertTriangle, Radio,
} from 'lucide-react'
import { environmentMetrics, environmentTrend } from '../data/mockData'

/* ── Status configs ───────────────────────────── */
const statusMap = {
  excellent: { color:'#4ade80', glow:'rgba(34,197,94,0.35)',  label:'EXCELLENT', icon:CheckCircle, badge:'badge-green' },
  normal:    { color:'#60a5fa', glow:'rgba(96,165,250,0.35)', label:'NORMAL',    icon:CheckCircle, badge:'badge-blue'  },
  caution:   { color:'#fbbf24', glow:'rgba(251,191,36,0.35)', label:'CAUTION',   icon:AlertTriangle,badge:'badge-amber'},
  critical:  { color:'#f87171', glow:'rgba(248,113,113,0.35)',label:'CRITICAL',  icon:AlertTriangle,badge:'badge-red'  },
}

const iconMap = { thermometer:Thermometer, droplets:Droplets, shield:Shield, wind:Wind, atom:Atom, activity:Activity }

/* ── Circular gauge with needle ──────────────── */
function CircularGauge({ value, min, max, unit, color, size=130 }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t) }, [])

  const pct = min !== null ? Math.max(0, Math.min(1, (value - min) / ((max - min) || 1))) : 0.75
  const R = size / 2 - 14
  const startAngle = 210  // degrees
  const sweepAngle = 300  // degrees
  const toRad = d => (d * Math.PI) / 180

  const describeArc = (progress) => {
    const angle = startAngle + progress * sweepAngle
    const x1 = size/2 + R * Math.cos(toRad(startAngle - 90))
    const y1 = size/2 + R * Math.sin(toRad(startAngle - 90))
    const x2 = size/2 + R * Math.cos(toRad(angle - 90))
    const y2 = size/2 + R * Math.sin(toRad(angle - 90))
    const large = progress * sweepAngle > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`
  }

  const needleAngle = startAngle + (animated ? pct : 0) * sweepAngle - 90
  const needleLen = R - 8
  const nx = size/2 + needleLen * Math.cos(toRad(needleAngle))
  const ny = size/2 + needleLen * Math.sin(toRad(needleAngle))
  const trackLen = 2 * Math.PI * R * (sweepAngle / 360)
  const valueLen = (animated ? pct : 0) * trackLen

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={`g${size}${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={`${color}60`} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>

      {/* Track bg */}
      <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth="8"
        strokeDasharray={`${2*Math.PI*R*(sweepAngle/360)} ${2*Math.PI*R*(1-sweepAngle/360+0.001)}`}
        strokeLinecap="round"
        transform={`rotate(${startAngle} ${size/2} ${size/2})`}
        style={{ transformOrigin:`${size/2}px ${size/2}px` }} />

      {/* Value arc */}
      <circle cx={size/2} cy={size/2} r={R} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${valueLen} ${2*Math.PI*R - valueLen}`}
        strokeLinecap="round"
        transform={`rotate(${startAngle} ${size/2} ${size/2})`}
        style={{
          transformOrigin:`${size/2}px ${size/2}px`,
          transition:'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)',
          filter:`drop-shadow(0 0 5px ${color})`
        }} />

      {/* Tick marks */}
      {Array.from({length:6},(_,i) => {
        const a = startAngle + (i/5)*sweepAngle - 90
        const ir = R - 12, or = R - 6
        return (
          <line key={i}
            x1={size/2 + ir*Math.cos(toRad(a))} y1={size/2 + ir*Math.sin(toRad(a))}
            x2={size/2 + or*Math.cos(toRad(a))} y2={size/2 + or*Math.sin(toRad(a))}
            stroke="rgba(71,85,105,0.5)" strokeWidth="1" />
        )
      })}

      {/* Needle */}
      <line x1={size/2} y1={size/2} x2={nx} y2={ny}
        stroke={color} strokeWidth="1.5" strokeLinecap="round"
        style={{ transition:'x2 1.2s ease, y2 1.2s ease', filter:`drop-shadow(0 0 3px ${color})` }} />
      <circle cx={size/2} cy={size/2} r="3.5" fill={color}
        style={{ filter:`drop-shadow(0 0 6px ${color})` }} />

      {/* Value text */}
      <text x={size/2} y={size/2+20} textAnchor="middle" fontSize="14" fontWeight="900" fill={color}>
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(2) : value}
      </text>
      <text x={size/2} y={size/2+32} textAnchor="middle" fontSize="8" fill="#475569">{unit}</text>
    </svg>
  )
}

/* ── Sensor card ──────────────────────────────── */
function SensorCard({ metric, index }) {
  const s = statusMap[metric.status] || statusMap.normal
  const Icon = iconMap[metric.icon] || Activity
  const StatusIcon = s.icon

  return (
    <div className="glass rounded-2xl p-4 flex flex-col items-center relative overflow-hidden anim-fade-up stat-card-fab"
      style={{ animationDelay:`${index*80}ms`, border:`1px solid ${s.color}20` }}>
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background:`linear-gradient(90deg,transparent,${s.color},transparent)` }} />

      {/* Icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background:`${s.color}18`, border:`1px solid ${s.color}35`, boxShadow:`0 0 12px ${s.glow}` }}>
        <Icon size={16} style={{ color:s.color }} />
      </div>

      {/* Gauge */}
      <CircularGauge
        value={metric.value} min={metric.min} max={metric.max}
        unit={metric.unit} color={s.color} size={110} />

      <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-wider text-center">{metric.label}</p>

      <div className={`fab-badge ${s.badge} mt-2`}>
        <StatusIcon size={8} />{s.label}
      </div>

      {/* Range */}
      {metric.min !== null && metric.max !== null && (
        <p className="text-[9px] text-slate-600 mt-1.5">
          Range: {metric.min}–{metric.max} {metric.unit}
        </p>
      )}

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
        style={{ background:`radial-gradient(ellipse at 50% 100%,${s.glow} 0%,transparent 70%)` }} />
    </div>
  )
}

/* ── Tooltip ──────────────────────────────────── */
const FabTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2.5" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-[11px] font-bold mb-0.5" style={{ color:p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

/* ── Real-time ticker ─────────────────────────── */
function LiveTicker() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  return (
    <span className="font-mono text-xs text-cyan-400 text-glow-cyan">
      {time.toLocaleTimeString('en-IN', { hour12:false })}
    </span>
  )
}

export default function Environment() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            <span className="gradient-text-cyan">Environment</span> Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Radio size={10} className="text-green-400 live-dot" />
            Clean room conditions &amp; environmental compliance · <LiveTicker />
          </p>
        </div>
        <div className="flex gap-2">
          <span className="fab-badge badge-green"><CheckCircle size={9} />ISO CLASS 5</span>
          <span className="fab-badge badge-cyan">ALL NOMINAL</span>
        </div>
      </div>

      {/* Quick status bar */}
      <div className="glass rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 shimmer-line opacity-40" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { l:'Temperature', v:'22°C',       s:'normal',    icon:Thermometer },
            { l:'Humidity',    v:'45%',        s:'normal',    icon:Droplets },
            { l:'Clean Room',  v:'ISO Class 5',s:'excellent', icon:Shield },
            { l:'Air Quality', v:'Excellent',  s:'excellent', icon:Wind },
          ].map(item => {
            const sc = statusMap[item.s]
            const Icon = item.icon
            return (
              <div key={item.l} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background:`${sc.color}10`, border:`1px solid ${sc.color}25` }}>
                <Icon size={15} style={{ color:sc.color }} />
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">{item.l}</p>
                  <p className="text-xs font-black" style={{ color:sc.color }}>{item.v}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sensor gauges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Live Sensor Readings</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {environmentMetrics.map((m, i) => <SensorCard key={m.id} metric={m} index={i} />)}
        </div>
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature trend */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up">
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#ef4444,transparent)' }} />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Temperature &amp; Humidity</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Today's readings</p>
            </div>
            <span className="fab-badge badge-red">TEMP/HUM</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={environmentTrend} margin={{ top:5, right:10, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false} />
              <Tooltip content={<FabTooltip />} />
              <ReferenceLine y={22} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={0.8} />
              <ReferenceLine y={45} stroke="#3b82f6" strokeDasharray="3 3" strokeWidth={0.8} />
              <Line type="monotone" dataKey="temperature" name="Temp °C" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidity" name="Humidity %" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Air quality trend */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'100ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#10b981,transparent)' }} />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Air Quality Index</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Today's readings</p>
            </div>
            <span className="fab-badge badge-green">AQI</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={environmentTrend} margin={{ top:5, right:10, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false} />
              <YAxis domain={[94,100]} tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
              <Tooltip content={<FabTooltip />} />
              <ReferenceLine y={96} stroke="#10b981" strokeDasharray="3 3" strokeWidth={0.8} label={{ value:'Min',fontSize:8,fill:'#10b981',position:'right' }} />
              <Line type="monotone" dataKey="airQuality" name="Air Quality %" stroke="#10b981" strokeWidth={2.5}
                dot={false} style={{ filter:'drop-shadow(0 0 4px #10b981)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compliance */}
      <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up">
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#4ade80,transparent)' }} />
        <h2 className="text-sm font-bold text-white mb-4">Compliance &amp; Certification Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { l:'ISO 14644 Compliance', v:'100%', n:'Clean room class maintained', s:'excellent' },
            { l:'Temperature Control',  v:'99.2%', n:'Within ±0.5°C tolerance',   s:'normal' },
            { l:'Humidity Control',     v:'98.7%', n:'Within ±2% tolerance',       s:'normal' },
          ].map(item => {
            const sc = statusMap[item.s]
            const Icon = sc.icon
            return (
              <div key={item.l} className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background:`${sc.color}08`, border:`1px solid ${sc.color}25` }}>
                <Icon size={16} style={{ color:sc.color }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400">{item.l}</p>
                  <p className="text-xl font-black mt-0.5" style={{ color:sc.color }}>{item.v}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{item.n}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
