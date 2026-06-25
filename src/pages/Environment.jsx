import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Thermometer, Droplets, Shield, Wind, Atom, Activity, CheckCircle, AlertTriangle, Radio } from 'lucide-react'
import { environmentMetrics, environmentTrend } from '../data/mockData'
import PageHero from '../components/PageHero'
const HERO_IMG = 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=1200&q=80&fit=crop'

const statusMap = {
  excellent: { color:'#16a34a', label:'Excellent', icon:CheckCircle,  badge:'badge-green' },
  normal:    { color:'#2563eb', label:'Normal',    icon:CheckCircle,  badge:'badge-blue'  },
  caution:   { color:'#d97706', label:'Caution',   icon:AlertTriangle,badge:'badge-amber' },
  critical:  { color:'#dc2626', label:'Critical',  icon:AlertTriangle,badge:'badge-red'   },
}
const iconMap = { thermometer:Thermometer, droplets:Droplets, shield:Shield, wind:Wind, atom:Atom, activity:Activity }

function CircularGauge({ value, min, max, unit, color, size=130 }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t) }, [])
  const pct = min !== null ? Math.max(0, Math.min(1, (value-min)/((max-min)||1))) : 0.75
  const R = size/2-14
  const startAngle = 210, sweepAngle = 300
  const toRad = d => d*Math.PI/180
  const trackLen = 2*Math.PI*R*(sweepAngle/360)
  const valueLen = (animated?pct:0)*trackLen
  const needleAngle = startAngle+(animated?pct:0)*sweepAngle-90
  const needleLen = R-8
  const nx = size/2+needleLen*Math.cos(toRad(needleAngle))
  const ny = size/2+needleLen*Math.sin(toRad(needleAngle))

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={`g${size}${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={`${color}60`}/>
          <stop offset="100%" stopColor={color}/>
        </linearGradient>
      </defs>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="#e2e8f0" strokeWidth="8"
        strokeDasharray={`${2*Math.PI*R*(sweepAngle/360)} ${2*Math.PI*R*(1-sweepAngle/360+0.001)}`}
        strokeLinecap="round"
        transform={`rotate(${startAngle} ${size/2} ${size/2})`}
        style={{ transformOrigin:`${size/2}px ${size/2}px` }}/>
      {/* Value arc */}
      <circle cx={size/2} cy={size/2} r={R} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${valueLen} ${2*Math.PI*R-valueLen}`}
        strokeLinecap="round"
        transform={`rotate(${startAngle} ${size/2} ${size/2})`}
        style={{ transformOrigin:`${size/2}px ${size/2}px`, transition:'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}/>
      {/* Tick marks */}
      {Array.from({length:6},(_,i) => {
        const a = startAngle+(i/5)*sweepAngle-90
        const ir=R-12, or=R-6
        return <line key={i}
          x1={size/2+ir*Math.cos(toRad(a))} y1={size/2+ir*Math.sin(toRad(a))}
          x2={size/2+or*Math.cos(toRad(a))} y2={size/2+or*Math.sin(toRad(a))}
          stroke="#cbd5e1" strokeWidth="1"/>
      })}
      {/* Needle */}
      <line x1={size/2} y1={size/2} x2={nx} y2={ny}
        stroke={color} strokeWidth="1.5" strokeLinecap="round"
        style={{ transition:'x2 1.2s ease, y2 1.2s ease' }}/>
      <circle cx={size/2} cy={size/2} r="3.5" fill={color}/>
      <text x={size/2} y={size/2+20} textAnchor="middle" fontSize="14" fontWeight="900" fill={color}>
        {typeof value==='number' && !Number.isInteger(value) ? value.toFixed(2) : value}
      </text>
      <text x={size/2} y={size/2+32} textAnchor="middle" fontSize="8" fill="#94a3b8">{unit}</text>
    </svg>
  )
}

function SensorCard({ metric, index }) {
  const s = statusMap[metric.status] || statusMap.normal
  const Icon = iconMap[metric.icon] || Activity
  const StatusIcon = s.icon
  return (
    <div className="card p-4 flex flex-col items-center relative overflow-hidden anim-fade-up"
      style={{ animationDelay:`${index*80}ms`, borderTop:`3px solid ${s.color}` }}>
      <div className="icon-box rounded-xl mb-3" style={{ background:`${s.color}12`, color:s.color }}>
        <Icon size={16}/>
      </div>
      <CircularGauge value={metric.value} min={metric.min} max={metric.max} unit={metric.unit} color={s.color} size={110}/>
      <p className="text-[10px] font-semibold text-slate-600 mt-1 uppercase tracking-wider text-center">{metric.label}</p>
      <div className={`badge ${s.badge} mt-2`}>
        <StatusIcon size={8}/>{s.label}
      </div>
      {metric.min !== null && metric.max !== null && (
        <p className="text-[9px] text-slate-400 mt-1.5">Range: {metric.min}–{metric.max} {metric.unit}</p>
      )}
    </div>
  )
}

const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2.5">
      <p className="text-[10px] text-slate-500 mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-[11px] font-bold mb-0.5" style={{ color:p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

function LiveTicker() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  return <span className="font-mono text-xs font-bold text-blue-600">{time.toLocaleTimeString('en-IN',{hour12:false})}</span>
}

export default function Environment() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-teal-600"/>
            <p className="section-label text-teal-700">Clean Room</p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
            Environment Monitoring
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 live-dot inline-block"/>
            Clean room conditions &amp; compliance · <LiveTicker/>
          </p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-green"><CheckCircle size={9}/>ISO Class 5</span>
          <span className="badge badge-cyan">All Nominal</span>
        </div>
      </div>

      {/* Quick status bar */}
      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { l:'Temperature', v:'22°C',        s:'normal',   icon:Thermometer },
            { l:'Humidity',    v:'45%',          s:'normal',   icon:Droplets },
            { l:'Clean Room',  v:'ISO Class 5',  s:'excellent',icon:Shield },
            { l:'Air Quality', v:'Excellent',    s:'excellent',icon:Wind },
          ].map(item => {
            const sc = statusMap[item.s]
            const Icon = item.icon
            return (
              <div key={item.l} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                style={{ background:`${sc.color}08`, borderColor:`${sc.color}20` }}>
                <Icon size={15} style={{ color:sc.color }}/>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">{item.l}</p>
                  <p className="text-xs font-bold" style={{ color:sc.color }}>{item.v}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sensor gauges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-blue-600"/>
          <h2 className="text-sm font-semibold text-slate-800">Live Sensor Readings</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {environmentMetrics.map((m,i) => <SensorCard key={m.id} metric={m} index={i}/>)}
        </div>
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5 anim-fade-up" style={{ borderTop:'3px solid #ef4444' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Temperature &amp; Humidity</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Today's readings</p>
            </div>
            <span className="badge badge-red">Temp/Hum</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={environmentTrend} margin={{ top:5, right:10, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="time" tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <ReferenceLine y={22} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={0.8}/>
              <ReferenceLine y={45} stroke="#3b82f6" strokeDasharray="3 3" strokeWidth={0.8}/>
              <Line type="monotone" dataKey="temperature" name="Temp °C" stroke="#ef4444" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="humidity" name="Humidity %" stroke="#3b82f6" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 anim-fade-up" style={{ animationDelay:'100ms', borderTop:'3px solid #16a34a' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Air Quality Index</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Today's readings</p>
            </div>
            <span className="badge badge-green">AQI</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={environmentTrend} margin={{ top:5, right:10, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="time" tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[94,100]} tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={<ChartTip/>}/>
              <ReferenceLine y={96} stroke="#16a34a" strokeDasharray="3 3" strokeWidth={0.8}
                label={{ value:'Min', fontSize:8, fill:'#16a34a', position:'right' }}/>
              <Line type="monotone" dataKey="airQuality" name="Air Quality %" stroke="#16a34a" strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compliance */}
      <div className="card p-5 anim-fade-up">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Compliance &amp; Certification Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { l:'ISO 14644 Compliance', v:'100%',  n:'Clean room class maintained', s:'excellent' },
            { l:'Temperature Control',  v:'99.2%', n:'Within ±0.5°C tolerance',     s:'normal' },
            { l:'Humidity Control',     v:'98.7%', n:'Within ±2% tolerance',         s:'normal' },
          ].map(item => {
            const sc = statusMap[item.s]
            const Icon = sc.icon
            return (
              <div key={item.l} className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background:`${sc.color}06`, borderColor:`${sc.color}20` }}>
                <Icon size={16} style={{ color:sc.color }} className="flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="text-[10px] font-semibold text-slate-600">{item.l}</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color:sc.color }}>{item.v}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.n}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
